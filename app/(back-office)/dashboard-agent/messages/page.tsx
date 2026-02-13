// app/(back-office)/dashboard-agent/messages/page.tsx
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
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";

// Types pour les utilisateurs
interface UtilisateurBase {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  boutique: {
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

interface SuperAdmin extends UtilisateurBase {}
interface Agent extends UtilisateurBase {}
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

interface ContactConversation extends UtilisateurBase {
  userType: "super_admin" | "agent" | "vendeur" | "utilisateur";
  lastMessageDate?: string;
  lastMessage?: string;
  unreadCount?: number;
  totalMessages?: number;
}

// Composant de badge de statut amélioré
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

  if (is_super_admin) {
    return (
      <span className="badge bg-purple bg-opacity-10 text-purple border border-purple border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
        <FontAwesomeIcon icon={faCrown} className="fs-12" />
        <span className="fw-medium">Super Admin</span>
      </span>
    );
  }

  if (is_admin) {
    return (
      <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 d-inline-flex align-items-center gap-1 px-3 py-2">
        <FontAwesomeIcon icon={faShield} className="fs-12" />
        <span className="fw-medium">Admin</span>
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

// ============================================
// COMPOSANT PRINCIPAL AVEC SUSPENSE
// ============================================
export default function ListeMessages() {
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
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<ContactConversation[]>([]);

  // États pour le chargement
  const [loading, setLoading] = useState({
    initial: true,
    superAdmins: false,
    agents: false,
    vendeurs: false,
    utilisateurs: false,
    messages: false,
    envoi: false,
  });

  // États pour les erreurs
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // États pour la sélection
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<ContactConversation | null>(null);

  // États pour les messages de succès/erreur
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // ✅ État pour stocker le message original en réponse
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // État pour le formulaire d'envoi de message
  const [newMessage, setNewMessage] = useState({
    destinataireEmail: "",
    destinataireUuid: "",
    sujet: "",
    contenu: "",
    type: "notification",
    expediteurNom: "Agent SONEC",
    expediteurEmail: "",
    expediteurUuid: "",
  });

  // Statistiques
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    sentMessages: 0,
    superAdmins: 0,
  });

  // Onglet actif
  const [activeTab, setActiveTab] = useState<"contacts" | "received" | "sent">(
    "contacts",
  );

  // Profil de l'agent connecté
  const [agentProfile, setAgentProfile] = useState<Agent | null>(null);

  // ✅ REF pour éviter les boucles infinies
  const isInitialLoad = useRef(true);
  const isFetchingContacts = useRef(false);
  const prevMessagesRecusLength = useRef(0);
  const prevMessagesEnvoyesLength = useRef(0);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>(null);

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

    if (destinataireEmail && agentProfile) {
      console.log("📨 Paramètres URL reçus:", {
        destinataireUuid,
        destinataireEmail,
        destinataireNom,
        sujet,
        produitUuid,
        donUuid,
        echangeUuid,
      });

      // ✅ CORRIGÉ: Ajout de la propriété 'boutique' requise par ContactConversation
      const contact: ContactConversation = {
        uuid: destinataireUuid || `contact-${Date.now()}`,
        email: destinataireEmail,
        nom: destinataireNom?.split(" ").pop() || "",
        prenoms:
          destinataireNom?.split(" ").slice(0, -1).join(" ") ||
          destinataireNom ||
          "Contact",
        telephone: "",
        boutique: {
          uuid: "",
          nom: "",
        },
        userType: detectUserTypeFromEmail(destinataireEmail) as any,
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
        type: "notification",
      }));

      setSelectedContact(contact);
      setActiveTab("contacts");

      // ✅ Nettoyer l'URL (supprimer les paramètres)
      const url = new URL(window.location.href);
      url.search = "";
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, agentProfile, router]);

  // ============================================
  // FONCTIONS UTILITAIRES D'AFFICHAGE
  // ============================================
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
      case "utilisateur":
        return faUser;
      default:
        return faUser;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "super_admin":
        return "purple";
      case "admin":
        return "info";
      case "agent":
        return "primary";
      case "vendeur":
        return "warning";
      case "utilisateur":
        return "success";
      default:
        return "secondary";
    }
  };

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
      case "utilisateur":
        return "Utilisateur";
      default:
        return "Inconnu";
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

  // ============================================
  // CHARGEMENT DU PROFIL
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
          type: profile.type,
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
      } else {
        console.warn("⚠️ Structure de réponse inattendue:", response);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement du profil agent:", err);
    }
  }, []);

  // ============================================
  // CHARGEMENT DES UTILISATEURS
  // ============================================
  const fetchSuperAdmins = useCallback(async () => {
    setLoading((prev) => ({ ...prev, superAdmins: true }));
    try {
      const response = await api.get<{
        data: SuperAdmin[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.AUTH.ADMIN.LISTE_ADMIN);

      if (response?.data) {
        setSuperAdmins(response.data);
      } else {
        setSuperAdmins([]);
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement super-admins:", err);
      setError("Erreur lors du chargement des super-admins");
    } finally {
      setLoading((prev) => ({ ...prev, superAdmins: false }));
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, agents: true }));
    try {
      const response = await api.get<{
        data: Agent[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.ADMIN.AGENTS.LIST);
      if (response?.data) {
        setAgents(response.data);
      }
    } catch (err: any) {
      console.error("❌ Error fetching agents:", err);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  }, []);

  const fetchVendeurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, vendeurs: true }));
    try {
      const response = await api.get<{
        data: Vendeur[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.ADMIN.VENDEURS.LIST);
      if (response?.data) {
        setVendeurs(response.data);
      }
    } catch (err: any) {
      console.error("❌ Error fetching vendeurs:", err);
    } finally {
      setLoading((prev) => ({ ...prev, vendeurs: false }));
    }
  }, []);

  const fetchUtilisateurs = useCallback(async () => {
    setLoading((prev) => ({ ...prev, utilisateurs: true }));
    try {
      const response = await api.get<{
        data: Utilisateur[];
        count: number;
        status: string;
      }>(API_ENDPOINTS.ADMIN.USERS.LIST);
      if (response?.data) {
        setUtilisateurs(response.data);
      }
    } catch (err: any) {
      console.error("❌ Error fetching utilisateurs:", err);
    } finally {
      setLoading((prev) => ({ ...prev, utilisateurs: false }));
    }
  }, []);

  // ============================================
  // CHARGEMENT DES MESSAGES
  // ============================================
  const fetchMessagesRecus = useCallback(async () => {
    setLoading((prev) => ({ ...prev, messages: true }));
    try {
      console.log("📥 Chargement des messages reçus...");
      const response = await api.get<MessageReceived[] | Message[]>(
        API_ENDPOINTS.MESSAGERIE.RECEIVED,
      );

      if (Array.isArray(response)) {
        const formattedMessages = response.map((item: any) => {
          const message = item.message || item;
          return {
            uuid: message.uuid || `msg-${Date.now()}`,
            sujet: message.sujet || "Sans sujet",
            contenu: message.contenu || "",
            expediteurNom: message.expediteurNom || "Expéditeur inconnu",
            expediteurEmail: message.expediteurEmail || "",
            expediteurUuid: message.expediteurUuid,
            destinataireEmail:
              message.destinataireEmail || agentProfile?.email || "",
            destinataireUuid: message.destinataireUuid || agentProfile?.uuid,
            type: (message.type || "notification").toUpperCase(),
            estEnvoye: false,
            envoyeLe:
              message.envoyeLe ||
              item.dateReception ||
              new Date().toISOString(),
            estLu: message.estLu || item.estLu || false,
            dateLecture: message.dateLecture || item.dateLecture || null,
          } as Message;
        });
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error("❌ Erreur chargement messages:", err);
      const demoMessages: Message[] = [
        {
          uuid: "demo-1",
          sujet: "Confirmation de votre inscription",
          contenu: "Bienvenue Agent ! Votre compte a été créé avec succès.",
          expediteurNom: "Super Admin",
          expediteurEmail: "superadmin@sonec.com",
          expediteurUuid: "superadmin-uuid",
          destinataireEmail: agentProfile?.email || "agent@sonec.com",
          destinataireUuid: agentProfile?.uuid,
          type: "SUPER_ADMIN",
          estEnvoye: true,
          estLu: false,
          envoyeLe: new Date().toISOString(),
          dateLecture: null,
        },
      ];
      setMessages(demoMessages);
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [agentProfile]);

  const fetchMessagesEnvoyes = useCallback(async () => {
    try {
      const response = await api.get<Message[]>(API_ENDPOINTS.MESSAGERIE.SENT);

      if (Array.isArray(response)) {
        const formattedMessages = response.map((msg: any) => ({
          uuid: msg.uuid || `sent-${Date.now()}`,
          sujet: msg.sujet || "Sans sujet",
          contenu: msg.contenu || "",
          expediteurNom:
            msg.expediteurNom || agentProfile?.nom || "Agent SONEC",
          expediteurEmail: msg.expediteurEmail || agentProfile?.email || "",
          expediteurUuid: msg.expediteurUuid || agentProfile?.uuid,
          destinataireEmail: msg.destinataireEmail || "",
          destinataireUuid: msg.destinataireUuid,
          type: (msg.type || "notification").toUpperCase(),
          estEnvoye: true,
          envoyeLe: msg.envoyeLe || new Date().toISOString(),
          estLu: msg.estLu || false,
          dateLecture: msg.dateLecture || null,
        }));
        setMessagesEnvoyes(formattedMessages);
      }
    } catch (err: any) {
      console.error("❌ Error fetching sent messages:", err);
    }
  }, [agentProfile]);

  // ============================================
  // ✅ CONSTRUCTION DES CONTACTS - CORRIGÉ AVEC BOUTIQUE
  // ============================================
  const buildContactsFromMessages = useCallback(() => {
    if (!agentProfile) return;

    if (isFetchingContacts.current) return;
    isFetchingContacts.current = true;

    try {
      console.log("👥 Construction des contacts depuis les messages...");

      const contactsMap = new Map<string, ContactConversation>();

      messages.forEach((msg) => {
        if (msg.expediteurEmail && msg.expediteurEmail !== agentProfile.email) {
          const key = msg.expediteurEmail;
          if (!contactsMap.has(key)) {
            // ✅ CORRIGÉ: Ajout de la propriété 'boutique' requise
            contactsMap.set(key, {
              uuid: msg.expediteurUuid || `contact-${Date.now()}-${key}`,
              email: msg.expediteurEmail,
              nom: msg.expediteurNom.split(" ").pop() || "",
              prenoms:
                msg.expediteurNom.split(" ").slice(0, -1).join(" ") ||
                msg.expediteurNom,
              telephone: "",
              boutique: {
                uuid: "",
                nom: "",
              },
              userType: detectUserTypeFromEmail(msg.expediteurEmail) as any,
              est_verifie: true,
              est_bloque: false,
              is_deleted: false,
              lastMessageDate: msg.envoyeLe,
              lastMessage: msg.contenu,
              unreadCount: !msg.estLu ? 1 : 0,
              totalMessages: 1,
            });
          } else {
            const contact = contactsMap.get(key)!;
            contact.totalMessages = (contact.totalMessages || 0) + 1;
            if (!msg.estLu) {
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
      });

      messagesEnvoyes.forEach((msg) => {
        if (
          msg.destinataireEmail &&
          msg.destinataireEmail !== agentProfile.email
        ) {
          const key = msg.destinataireEmail;
          if (!contactsMap.has(key)) {
            // ✅ CORRIGÉ: Ajout de la propriété 'boutique' requise
            contactsMap.set(key, {
              uuid: msg.destinataireUuid || `contact-${Date.now()}-${key}`,
              email: msg.destinataireEmail,
              nom: "",
              prenoms: msg.destinataireEmail.split("@")[0] || "Contact",
              telephone: "",
              boutique: {
                uuid: "",
                nom: "",
              },
              userType: detectUserTypeFromEmail(msg.destinataireEmail) as any,
              est_verifie: true,
              est_bloque: false,
              is_deleted: false,
              lastMessageDate: msg.envoyeLe,
              lastMessage: msg.contenu,
              unreadCount: 0,
              totalMessages: 1,
            });
          } else {
            const contact = contactsMap.get(key)!;
            contact.totalMessages = (contact.totalMessages || 0) + 1;
            if (
              new Date(msg.envoyeLe) > new Date(contact.lastMessageDate || "")
            ) {
              contact.lastMessageDate = msg.envoyeLe;
              contact.lastMessage = msg.contenu;
            }
          }
        }
      });

      const contactsArray = Array.from(contactsMap.values())
        .filter((c) => c.email !== agentProfile.email)
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
  }, [agentProfile, messages, messagesEnvoyes]);

  // ============================================
  // ✅ CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading((prev) => ({ ...prev, initial: true }));
      try {
        await fetchAgentProfile();
        await fetchSuperAdmins();
        await fetchAgents();
        await fetchVendeurs();
        await fetchUtilisateurs();
        await fetchMessagesRecus();
        await fetchMessagesEnvoyes();
        isInitialLoad.current = false;
      } catch (err) {
        console.error("❌ Erreur chargement initial:", err);
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    };
    loadInitialData();
  }, [
    fetchAgentProfile,
    fetchSuperAdmins,
    fetchAgents,
    fetchVendeurs,
    fetchUtilisateurs,
    fetchMessagesRecus,
    fetchMessagesEnvoyes,
  ]);

  // ============================================
  // ✅ CONSTRUCTION DES CONTACTS APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!agentProfile) return;

    const messagesRecusChanged =
      prevMessagesRecusLength.current !== messages.length;
    const messagesEnvoyesChanged =
      prevMessagesEnvoyesLength.current !== messagesEnvoyes.length;

    if (messagesRecusChanged || messagesEnvoyesChanged) {
      buildContactsFromMessages();

      prevMessagesRecusLength.current = messages.length;
      prevMessagesEnvoyesLength.current = messagesEnvoyes.length;
    }
  }, [agentProfile, messages, messagesEnvoyes, buildContactsFromMessages]);

  // ============================================
  // ✅ GESTION DES PARAMÈTRES URL APRÈS CHARGEMENT
  // ============================================
  useEffect(() => {
    if (agentProfile && !loading.initial) {
      handleUrlParams();
    }
  }, [agentProfile, loading.initial, handleUrlParams]);

  // ============================================
  // STATISTIQUES
  // ============================================
  useEffect(() => {
    const totalUsers =
      superAdmins.length +
      agents.length +
      vendeurs.length +
      utilisateurs.length;
    const totalMessages = messages.length + messagesEnvoyes.length;
    const unreadMessages = messages.filter((m) => !m.estLu).length;

    setStats({
      totalUsers,
      totalMessages,
      unreadMessages,
      sentMessages: messagesEnvoyes.length,
      superAdmins: superAdmins.length,
    });
  }, [superAdmins, agents, vendeurs, utilisateurs, messages, messagesEnvoyes]);

  // ============================================
  // COMBINER TOUS LES UTILISATEURS POUR LES CONTACTS
  // ============================================
  const allUsers = useMemo(() => {
    const users: ContactConversation[] = [];

    // Super Admins
    superAdmins.forEach((user) => {
      users.push({
        ...user,
        userType: "super_admin",
      });
    });

    // Agents
    agents.forEach((user) => {
      users.push({
        ...user,
        userType: "agent",
      });
    });

    // Vendeurs
    vendeurs.forEach((user) => {
      users.push({
        ...user,
        userType: "vendeur",
      });
    });

    // Utilisateurs
    utilisateurs.forEach((user) => {
      users.push({
        ...user,
        userType: "utilisateur",
      });
    });

    return users;
  }, [superAdmins, agents, vendeurs, utilisateurs]);

  // ============================================
  // FILTRAGE DES CONTACTS
  // ============================================
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Ajouter les utilisateurs qui n'ont pas encore de conversation
    allUsers.forEach((user) => {
      const exists = result.some((c) => c.email === user.email);
      if (!exists && user.email !== agentProfile?.email) {
        result.push({
          ...user,
          lastMessageDate: undefined,
          lastMessage: undefined,
          unreadCount: 0,
          totalMessages: 0,
        });
      }
    });

    result = result.filter((c) => !c.is_deleted);

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

    if (selectedStatus !== "all") {
      if (selectedStatus === "active") {
        result = result.filter((c) => !c.est_bloque && c.est_verifie);
      } else if (selectedStatus === "blocked") {
        result = result.filter((c) => c.est_bloque);
      } else if (selectedStatus === "unverified") {
        result = result.filter((c) => !c.est_verifie);
      }
    }

    // Trier par date du dernier message
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
  }, [
    contacts,
    allUsers,
    agentProfile,
    searchTerm,
    selectedType,
    selectedStatus,
  ]);

  // ============================================
  // ✅ ACTIONS - AVEC MESSAGE ORIGINAL EN LECTURE SEULE
  // ============================================
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

    const messageData = {
      destinataireEmail: newMessage.destinataireEmail.trim(),
      destinataireUuid: newMessage.destinataireUuid,
      sujet: newMessage.sujet.trim(),
      contenu: newMessage.contenu.trim(),
      type: newMessage.type.toLowerCase(),
    };

    setLoading((prev) => ({ ...prev, envoi: true }));
    setError(null);
    setApiError(null);

    try {
      const response = await api.post(
        API_ENDPOINTS.MESSAGERIE.SEND,
        messageData,
      );

      const sentMessage: Message = {
        uuid: `temp-${Date.now()}`,
        sujet: messageData.sujet,
        contenu: messageData.contenu,
        expediteurNom: newMessage.expediteurNom,
        expediteurEmail: newMessage.expediteurEmail,
        expediteurUuid: newMessage.expediteurUuid,
        destinataireEmail: messageData.destinataireEmail,
        destinataireUuid: messageData.destinataireUuid,
        type: newMessage.type.toUpperCase(),
        estEnvoye: true,
        envoyeLe: new Date().toISOString(),
        estLu: false,
        dateLecture: null,
      };

      setMessagesEnvoyes((prev) => [sentMessage, ...prev]);
      setSuccessMessage("Message envoyé avec succès !");

      // ✅ Réinitialiser le message original
      setReplyToMessage(null);

      setNewMessage({
        destinataireEmail: "",
        destinataireUuid: "",
        sujet: "",
        contenu: "",
        type: "notification",
        expediteurNom: agentProfile
          ? `${agentProfile.prenoms || ""} ${agentProfile.nom || ""}`.trim()
          : "Agent SONEC",
        expediteurEmail: agentProfile?.email || "",
        expediteurUuid: agentProfile?.uuid || "",
      });

      setSelectedContact(null);
      setActiveTab("sent");
    } catch (err: any) {
      console.error("❌ Erreur détaillée lors de l'envoi:", err);

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
    } finally {
      setLoading((prev) => ({ ...prev, envoi: false }));
      setTimeout(() => {
        setSuccessMessage(null);
        setApiError(null);
      }, 5000);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.uuid === messageId ? { ...msg, estLu: true } : msg,
      ),
    );
    if (selectedMessage?.uuid === messageId) {
      setSelectedMessage((prev) => (prev ? { ...prev, estLu: true } : null));
    }
  };

  // ✅ CORRECTION: Répondre avec message original en lecture seule
  const handleReply = (message: Message) => {
    // Stocker le message original
    setReplyToMessage(message);

    // Mettre à jour le formulaire
    setNewMessage({
      ...newMessage,
      destinataireEmail: message.expediteurEmail,
      destinataireUuid: message.expediteurUuid || "",
      sujet: `RE: ${message.sujet}`,
      contenu: "", // Le contenu est vide, le message original sera affiché séparément
      type:
        message.type.toLowerCase() === "super_admin"
          ? "super_admin"
          : "notification",
    });

    const contact = contacts.find((c) => c.email === message.expediteurEmail);
    if (contact) setSelectedContact(contact);
    setActiveTab("contacts");
  };

  // ✅ Fonction pour annuler la réponse
  const handleCancelReply = () => {
    setReplyToMessage(null);
    setNewMessage({
      ...newMessage,
      sujet: "",
      contenu: "",
    });
  };

  const selectContactForMessage = (contact: ContactConversation) => {
    // ✅ Annuler toute réponse en cours
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

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredContacts.length) {
      setSelectedUsers([]);
    } else {
      const allContactIds = filteredContacts.map((contact) => contact.uuid);
      setSelectedUsers(allContactIds);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleRefresh = () => {
    fetchMessagesRecus();
    fetchMessagesEnvoyes();
  };

  // ============================================
  // GROUPEMENT DES MESSAGES
  // ============================================
  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => ({
      message,
      showSeparator: index > 0 && index % 3 === 0,
    }));
  }, [messages]);

  // ============================================
  // RENDU
  // ============================================
  if (loading.initial) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement de votre messagerie...</p>
        </div>
      </div>
    );
  }

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
              Messagerie Agent
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              {contacts.length > 0
                ? `${contacts.length} contact${contacts.length > 1 ? "s" : ""} avec qui vous avez échangé`
                : "Commencez une conversation avec un contact"}
            </p>
            {agentProfile && (
              <small className="text-success d-flex align-items-center gap-2 mt-1">
                <FontAwesomeIcon icon={faUserTie} />
                Connecté en tant que: {agentProfile.email}
              </small>
            )}
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

        {/* Cartes de statistiques améliorées */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Super Admins"
              value={stats.superAdmins}
              icon={faCrown}
              color="purple"
              subtitle="Administrateurs principaux"
              trend="up"
              isLoading={loading.superAdmins}
            />
          </div>
          <div className="col-xl-3 col-lg-6">
            <StatsCard
              title="Agents"
              value={agents.length}
              icon={faUserTie}
              color="primary"
              subtitle="Agents actifs"
              trend="neutral"
              isLoading={loading.agents}
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
                            {filteredContacts.length > 0
                              ? `${filteredContacts.length} contact(s) avec qui vous avez échangé`
                              : "Vous n'avez pas encore échangé de messages"}
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
                              <option value="all">Tous les types</option>
                              <option value="super_admin">Super Admins</option>
                              <option value="admin">Admins</option>
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
                      {filteredContacts.length === 0 ? (
                        <div className="text-center py-5">
                          <FontAwesomeIcon
                            icon={faUsers}
                            className="fs-1 text-muted mb-3 opacity-25"
                          />
                          <h5
                            className="fw-semibold mb-2"
                            style={{ fontSize: "0.9rem" }}
                          >
                            Aucun contact trouvé
                          </h5>
                          <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                            {contacts.length === 0
                              ? "Vous n'avez pas encore échangé de messages"
                              : "Aucun contact ne correspond à vos filtres"}
                          </p>
                        </div>
                      ) : (
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
                                  <span className="text-muted fw-medium">
                                    #
                                  </span>
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
                              {filteredContacts.map((contact, index) => (
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
                                          handleSelectUser(contact.uuid)
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
                                          {contact.unreadCount ? (
                                            <span className="badge bg-danger ms-1">
                                              {contact.unreadCount}
                                            </span>
                                          ) : null}
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
                                      is_super_admin={
                                        contact.userType === "super_admin"
                                      }
                                      is_admin={
                                        contact.userType === "super_admin"
                                          ? false
                                          : contact.is_admin
                                      }
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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
                          {agentProfile && (
                            <small className="text-info d-flex align-items-center gap-1 mt-1">
                              <FontAwesomeIcon icon={faUserTie} />
                              Expéditeur: {agentProfile.email}
                            </small>
                          )}
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

                      {/* ✅ AFFICHAGE DU MESSAGE ORIGINAL EN LECTURE SEULE */}
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
                            <option value="notification">Notification</option>
                            <option value="alert">Alerte</option>
                            <option value="info">Information</option>
                            <option value="warning">Avertissement</option>
                            <option value="super_admin">Super Admin</option>
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
                                <span className="spinner-border spinner-border-sm"></span>
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

            {/* ======================================== */}
            {/* ONGLET: MESSAGES REÇUS */}
            {/* ======================================== */}
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
                              showSeparator={showSeparator}
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
                              <span
                                className={`badge bg-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : selectedMessage.type.toUpperCase() === "SUPER_ADMIN" ? "purple" : "primary"} bg-opacity-10 text-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : selectedMessage.type.toUpperCase() === "SUPER_ADMIN" ? "purple" : "primary"} border border-${selectedMessage.type.toUpperCase() === "ALERT" ? "danger" : selectedMessage.type.toUpperCase() === "WARNING" ? "warning" : selectedMessage.type.toUpperCase() === "SUPER_ADMIN" ? "purple" : "primary"} border-opacity-25 px-2 py-1`}
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

            {/* ======================================== */}
            {/* ONGLET: MESSAGES ENVOYÉS */}
            {/* ======================================== */}
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
                                      Expéditeur: {message.expediteurEmail}
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
                                      className={`badge bg-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : message.type === "SUPER_ADMIN" ? "purple" : "primary"} bg-opacity-10 text-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : message.type === "SUPER_ADMIN" ? "purple" : "primary"} border border-${message.type === "ALERT" ? "danger" : message.type === "WARNING" ? "warning" : message.type === "SUPER_ADMIN" ? "purple" : "primary"} border-opacity-25 px-2 py-1 fw-medium`}
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
                                        setReplyToMessage(null);
                                        setNewMessage({
                                          ...newMessage,
                                          destinataireEmail:
                                            message.destinataireEmail,
                                          destinataireUuid:
                                            message.destinataireUuid || "",
                                          sujet: `RE: ${message.sujet}`,
                                          contenu: "",
                                          type:
                                            message.type.toLowerCase() ===
                                            "super_admin"
                                              ? "super_admin"
                                              : "notification",
                                          expediteurNom: agentProfile
                                            ? `${agentProfile.prenoms || ""} ${agentProfile.nom || ""}`.trim()
                                            : "Agent SONEC",
                                          expediteurEmail:
                                            agentProfile?.email || "",
                                          expediteurUuid:
                                            agentProfile?.uuid || "",
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

// ============================================
// COMPOSANT MESSAGE ITEM - AVEC FONCTION RÉPONDRE
// ============================================
const MessageItem = ({
  message,
  isSelected,
  onSelect,
  onReply,
  showSeparator = false,
}: {
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
  onReply?: (message: Message) => void;
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
      case "SUPER_ADMIN":
        return "purple";
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
      case "SUPER_ADMIN":
        return faCrown;
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
                {message.type.toUpperCase() === "SUPER_ADMIN" && (
                  <span className="badge bg-purple bg-opacity-10 text-purple border border-purple border-opacity-25 px-2 py-1">
                    <FontAwesomeIcon icon={faCrown} className="fs-10 me-1" />
                    Super Admin
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
                {message.type.toUpperCase() === "SUPER_ADMIN"
                  ? "SUPER ADMIN"
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
              <span>Voir</span>
            </button>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                if (onReply) onReply(message);
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
