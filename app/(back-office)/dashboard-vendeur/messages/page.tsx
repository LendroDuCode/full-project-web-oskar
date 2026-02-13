// app/(back-office)/dashboard-vendeur/messages/page.tsx
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
} from "@fortawesome/free-solid-svg-icons";

// Import des services et hooks
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { LoadingSpinner } from "@/app/shared/components/ui/LoadingSpinner";

// ============================================
// TYPES - CORRIGÉS
// ============================================
interface UtilisateurBase {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  // ✅ Rendre boutique optionnelle dans la base
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

// ✅ VendeurProfile hérite correctement sans conflit
interface VendeurProfile extends UtilisateurBase {
  userType?: "vendeur";
}

interface Agent extends UtilisateurBase {
  userType?: "agent";
}

interface Vendeur extends UtilisateurBase {
  userType?: "vendeur";
}

interface Utilisateur extends UtilisateurBase {
  userType?: "utilisateur";
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
                  <LoadingSpinner size="sm" />
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
const isAdminUser = (user: UtilisateurBase): boolean => {
  const email = user.email?.toLowerCase() || "";
  const roleName = user.role?.name?.toLowerCase() || "";

  if (email.includes("admin") || email.includes("superadmin")) {
    return true;
  }

  if (roleName.includes("admin") && !roleName.includes("utilisateur")) {
    return true;
  }

  return false;
};

const getUserTypeFromRole = (roleName?: string): string => {
  if (!roleName) return "utilisateur";

  const roleLower = roleName.toLowerCase();

  if (roleLower.includes("agent")) return "agent";
  if (roleLower.includes("vendeur")) return "vendeur";
  if (roleLower.includes("utilisateur") || roleLower.includes("user"))
    return "utilisateur";
  if (roleLower.includes("admin") || roleLower.includes("superadmin"))
    return "admin";

  return "utilisateur";
};

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

// ============================================
// COMPOSANT PRINCIPAL AVEC SUSPENSE
// ============================================
export default function MessagerieVendeur() {
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
  const [vendeurProfile, setVendeurProfile] = useState<VendeurProfile | null>(
    null,
  );

  // États pour le chargement
  const [loading, setLoading] = useState({
    initial: true,
    contacts: false,
    messages: false,
    envoi: false,
    profile: false,
  });

  // États pour les erreurs et succès
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // États pour la sélection
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedContact, setSelectedContact] =
    useState<ContactConversation | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  // REF pour éviter les boucles infinies
  const isInitialLoad = useRef(true);
  const isFetchingContacts = useRef(false);
  const prevMessagesRecusLength = useRef(0);
  const prevMessagesEnvoyesLength = useRef(0);
  const hasLoadedInitialData = useRef(false);

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

    if (destinataireEmail && vendeurProfile) {
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

      // Nettoyer l'URL (supprimer les paramètres)
      const url = new URL(window.location.href);
      url.search = "";
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, vendeurProfile, router]);

  // ============================================
  // FONCTIONS UTILITAIRES D'AFFICHAGE
  // ============================================
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "admin":
        return faUserShield;
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
        return "Agent";
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

  // ============================================
  // ✅ CHARGEMENT DU PROFIL - SANS DÉPENDANCES CYCLIQUES
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
        setNewMessage((prev) => ({
          ...prev,
          expediteurEmail: profile.email || "vendeur@sonec.com",
          expediteurNom:
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
            "Vendeur SONEC",
          expediteurUuid: profile.uuid || "",
        }));
        return profile;
      }
    } catch (err) {
      console.error("❌ Erreur chargement profil vendeur:", err);
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
      } catch (err) {
        console.error("❌ Erreur chargement messages reçus:", err);
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [],
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
              expediteurNom: msg.expediteurNom || profileNom || "Vendeur SONEC",
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
  // CONSTRUCTION DES CONTACTS
  // ============================================
  const buildContactsFromMessages = useCallback(() => {
    if (!vendeurProfile) return;

    if (isFetchingContacts.current) return;
    isFetchingContacts.current = true;

    try {
      console.log("👥 Construction des contacts depuis les messages...");

      const contactsMap = new Map<string, ContactConversation>();

      messagesRecus.forEach((msg) => {
        if (
          msg.expediteurEmail &&
          msg.expediteurEmail !== vendeurProfile.email
        ) {
          const key = msg.expediteurEmail;
          if (!contactsMap.has(key)) {
            contactsMap.set(key, {
              uuid: msg.expediteurUuid || `contact-${Date.now()}-${key}`,
              email: msg.expediteurEmail,
              nom: msg.expediteurNom.split(" ").pop() || "",
              prenoms:
                msg.expediteurNom.split(" ").slice(0, -1).join(" ") ||
                msg.expediteurNom,
              telephone: "",
              userType: detectUserTypeFromEmail(msg.expediteurEmail),
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
          msg.destinataireEmail !== vendeurProfile.email
        ) {
          const key = msg.destinataireEmail;
          if (!contactsMap.has(key)) {
            contactsMap.set(key, {
              uuid: msg.destinataireUuid || `contact-${Date.now()}-${key}`,
              email: msg.destinataireEmail,
              nom: "",
              prenoms: msg.destinataireEmail.split("@")[0] || "Contact",
              telephone: "",
              userType: detectUserTypeFromEmail(msg.destinataireEmail),
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

      console.log(
        `✅ ${contactsArray.length} contacts trouvés dans les messages`,
      );
      setContacts(contactsArray);
    } catch (err) {
      console.error("❌ Erreur construction contacts:", err);
    } finally {
      isFetchingContacts.current = false;
    }
  }, [vendeurProfile, messagesRecus, messagesEnvoyes]);

  // ============================================
  // ✅ CHARGEMENT INITIAL - UNE SEULE FOIS
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
          await fetchMessagesRecus(profile.email, profile.uuid);
          await fetchMessagesEnvoyes(
            `${profile.prenoms || ""} ${profile.nom || ""}`.trim() ||
              "Vendeur SONEC",
            profile.email,
            profile.uuid,
          );
        }

        hasLoadedInitialData.current = true;
        isInitialLoad.current = false;
      } catch (err) {
        console.error("❌ Erreur chargement initial:", err);
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
  }, []); // ✅ TABLEAU VIDE - EXÉCUTÉ UNE SEULE FOIS

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
  // ✅ GESTION DES PARAMÈTRES URL APRÈS CHARGEMENT
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

    return result;
  }, [contacts, searchTerm, selectedType, selectedStatus]);

  // ============================================
  // ACTIONS
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

    try {
      const messageData = {
        destinataireEmail: newMessage.destinataireEmail.trim(),
        sujet: newMessage.sujet.trim(),
        contenu: newMessage.contenu.trim(),
        type: newMessage.type.toLowerCase(),
      };

      await api.post<any>(API_ENDPOINTS.MESSAGERIE.PUBLIC_SEND, messageData);

      const sentMessage: Message = {
        uuid: `temp-${Date.now()}`,
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
      setSuccessMessage("Message envoyé avec succès !");

      // Réinitialiser le message original
      setReplyToMessage(null);

      setNewMessage({
        destinataireEmail: "",
        destinataireUuid: "",
        sujet: "",
        contenu: "",
        type: "NOTIFICATION",
        expediteurNom: newMessage.expediteurNom,
        expediteurEmail: newMessage.expediteurEmail,
        expediteurUuid: newMessage.expediteurUuid,
      });

      setSelectedContact(null);
      setActiveTab("sent");
    } catch (err: any) {
      console.error("❌ Erreur envoi message:", err);
      setError(err.message || "Erreur lors de l'envoi du message");
    } finally {
      setLoading((prev) => ({ ...prev, envoi: false }));
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    setMessagesRecus((prev) =>
      prev.map((msg) =>
        msg.uuid === messageId ? { ...msg, estLu: true } : msg,
      ),
    );
    if (selectedMessage?.uuid === messageId) {
      setSelectedMessage((prev) => (prev ? { ...prev, estLu: true } : null));
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
    if (vendeurProfile) {
      fetchMessagesRecus(vendeurProfile.email, vendeurProfile.uuid);
      fetchMessagesEnvoyes(
        `${vendeurProfile.prenoms || ""} ${vendeurProfile.nom || ""}`.trim() ||
          "Vendeur SONEC",
        vendeurProfile.email,
        vendeurProfile.uuid,
      );
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
              Messagerie Vendeur
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

        {/* Cartes de statistiques améliorées */}
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
              title="Conversations"
              value={contacts.length}
              icon={faCommentDots}
              color="warning"
              subtitle="Conversations actives"
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
                            {contacts.length > 0
                              ? `${contacts.length} contact(s) avec qui vous avez échangé`
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
                              <option value="admin">Admin</option>
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
                                <LoadingSpinner size="sm" color="white" />
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
                            {messagesRecus.length} message(s)
                          </span>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center gap-2"
                            onClick={() =>
                              vendeurProfile &&
                              fetchMessagesRecus(
                                vendeurProfile.email,
                                vendeurProfile.uuid,
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
                      {loading.messages ? (
                        <div className="text-center py-5">
                          <LoadingSpinner
                            size="md"
                            text="Chargement des messages..."
                          />
                        </div>
                      ) : messagesRecus.length === 0 ? (
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
                            <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                              Vos messages apparaîtront ici
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="list-group list-group-flush px-3 py-2"
                          style={{ maxHeight: "500px", overflowY: "auto" }}
                        >
                          {groupedMessages.map(({ message, showSeparator }) => (
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
                          ))}
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
                            onClick={() =>
                              vendeurProfile &&
                              fetchMessagesEnvoyes(
                                `${vendeurProfile.prenoms || ""} ${vendeurProfile.nom || ""}`.trim() ||
                                  "Vendeur SONEC",
                                vendeurProfile.email,
                                vendeurProfile.uuid,
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
                      {loading.messages ? (
                        <div className="text-center py-5">
                          <LoadingSpinner
                            size="md"
                            text="Chargement des messages..."
                          />
                        </div>
                      ) : messagesEnvoyes.length === 0 ? (
                        <div className="text-center py-4">
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
                            <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                              Envoyez votre premier message depuis l'onglet "Mes
                              contacts"
                            </p>
                          </div>
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
                              {messagesEnvoyes.map((message) => (
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
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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
              <span style={{ fontSize: "0.8rem" }}>Voir</span>
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
