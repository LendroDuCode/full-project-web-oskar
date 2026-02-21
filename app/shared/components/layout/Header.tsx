"use client";

import Link from "next/link";
import { FC, useState, useRef, useEffect, useCallback } from "react";
import colors from "../../constants/colors";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import { api } from "@/lib/api-client";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE ROBUSTE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  // Nettoyer le chemin des espaces indésirables
  let cleanPath = imagePath
    .replace(/\s+/g, "") // Supprimer tous les espaces
    .replace(/-/g, "-") // Normaliser les tirets
    .trim();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://oskar-api.mysonec.pro";
  const filesUrl = process.env.NEXT_PUBLIC_FILES_URL || "/api/files";

  // ✅ CAS 1: Déjà une URL complète
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.includes("localhost")) {
      const productionUrl = apiUrl.replace(/\/api$/, "");
      return cleanPath.replace(/http:\/\/localhost(:\d+)?/g, productionUrl);
    }
    return cleanPath;
  }

  // ✅ CAS 2: Chemin avec %2F (déjà encodé)
  if (cleanPath.includes("%2F")) {
    // Nettoyer les espaces autour de %2F
    const finalPath = cleanPath.replace(/%2F\s+/, "%2F");
    return `${apiUrl}${filesUrl}/${finalPath}`;
  }

  // ✅ CAS 3: Chemin simple
  return `${apiUrl}${filesUrl}/${cleanPath}`;
};

interface NavLink {
  name: string;
  href: string;
  exact?: boolean;
  hasChildren?: boolean;
  children?: { name: string; href: string }[];
}

interface Category {
  uuid: string;
  libelle: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  enfants?: Category[];
  path?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  id?: number;
}

interface UserProfile {
  uuid: string;
  email: string;
  nom?: string;
  prenoms?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  avatar_key?: string;
  type: "admin" | "agent" | "vendeur" | "utilisateur";
  role?: string;
  isSuperAdmin?: boolean;
  nom_complet?: string;
  est_bloque?: boolean;
  civilite?: {
    libelle?: string;
  };
}

// Catégories par défaut en cas d'erreur API
const defaultCategories: Category[] = [
  {
    uuid: "dons-echanges-uuid",
    libelle: "Don & Échange",
    slug: "dons-echanges",
    type: "main",
    description: "Dons et échanges entre particuliers",
    enfants: [],
  },
  {
    uuid: "vetements-chaussures-uuid",
    libelle: "Vêtements & Chaussures",
    slug: "vetements-chaussures",
    type: "main",
    description: "Vêtements et chaussures",
    enfants: [],
  },
  {
    uuid: "electronique-uuid",
    libelle: "Électronique",
    slug: "electronique",
    type: "main",
    description: "Appareils électroniques et accessoires",
    enfants: [],
  },
  {
    uuid: "education-culture-uuid",
    libelle: "Éducation & Culture",
    slug: "education-culture",
    type: "main",
    description: "Livres, fournitures scolaires, culture",
    enfants: [],
  },
  {
    uuid: "services-proximite-uuid",
    libelle: "Services de proximité",
    slug: "services-proximite",
    type: "main",
    description: "Services locaux",
    enfants: [],
  },
  {
    uuid: "maison-jardin-uuid",
    libelle: "Maison & Jardin",
    slug: "maison-jardin",
    type: "main",
    description: "Articles pour la maison et le jardin",
    enfants: [],
  },
  {
    uuid: "vehicules-uuid",
    libelle: "Véhicules",
    slug: "vehicules",
    type: "main",
    description: "Voitures, motos, vélos",
    enfants: [],
  },
  {
    uuid: "emploi-services-uuid",
    libelle: "Emploi & Services",
    slug: "emploi-services",
    type: "main",
    description: "Offres d'emploi et services professionnels",
    enfants: [],
  },
];

const Header: FC = () => {
  const pathname = usePathname();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState<
    string | null
  >(null);
  const [unreadMessagesCount] = useState(2);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  const { isLoggedIn, user, logout, openLoginModal, closeModals } = useAuth();

  const headerKey = `header-${isLoggedIn ? "logged-in" : "logged-out"}-${user?.type || "none"}-${user?.uuid?.substring(0, 8) || "none"}-${forceUpdate}`;

  // Détection de la taille d'écran avec breakpoints précis
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Fermer les menus sur passage en desktop
      if (window.innerWidth >= 992) {
        setMobileMenuOpen(false);
      }
    };

    // Initialiser
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Breakpoints plus précis pour un meilleur contrôle
  const breakpoints = {
    xs: 0, // < 576px : très petits mobiles
    sm: 576, // 576px - 767px : mobiles standards
    md: 768, // 768px - 991px : tablettes
    lg: 992, // 992px - 1199px : petits desktops
    xl: 1200, // 1200px - 1399px : desktops standards
    xxl: 1400, // ≥ 1400px : grands écrans
  };

  const isXs = windowWidth < breakpoints.sm;
  const isSm = windowWidth >= breakpoints.sm && windowWidth < breakpoints.md;
  const isMd = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isLg = windowWidth >= breakpoints.lg && windowWidth < breakpoints.xl;
  const isXl = windowWidth >= breakpoints.xl && windowWidth < breakpoints.xxl;
  const isXxl = windowWidth >= breakpoints.xxl;

  const isMobile = windowWidth < breakpoints.lg;
  const isTablet =
    windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isDesktop = windowWidth >= breakpoints.lg;

  // Fonctions utilitaires pour les tailles responsives
  const getResponsiveSize = (sizes: {
    xs?: any;
    sm?: any;
    md?: any;
    lg?: any;
    xl?: any;
    xxl?: any;
  }) => {
    if (isXxl && sizes.xxl !== undefined) return sizes.xxl;
    if (isXl && sizes.xl !== undefined) return sizes.xl;
    if (isLg && sizes.lg !== undefined) return sizes.lg;
    if (isMd && sizes.md !== undefined) return sizes.md;
    if (isSm && sizes.sm !== undefined) return sizes.sm;
    return sizes.xs !== undefined ? sizes.xs : sizes.sm || sizes.md || sizes.lg;
  };

  const getFontSize = (base: number) => {
    if (isXs) return base * 0.7;
    if (isSm) return base * 0.8;
    if (isMd) return base * 0.9;
    return base;
  };

  const getSpacing = (base: number) => {
    if (isXs) return base * 0.5;
    if (isSm) return base * 0.75;
    if (isMd) return base * 0.9;
    return base;
  };

  // ÉCOUTER L'ÉVÉNEMENT DE DÉCONNEXION POUR METTRE À JOUR L'ÉTAT
  useEffect(() => {
    const handleLogoutEvent = () => {
      console.log("🔄 Header - Logout event detected, updating state...");

      // Vider le profil utilisateur immédiatement
      setUserProfile(null);
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      setAvatarError(false);
      setForceUpdate((prev) => prev + 1);

      // Rediriger vers la page d'accueil si on est sur une page dashboard
      if (pathname.startsWith("/dashboard-")) {
        window.location.href = "/";
      }
    };

    window.addEventListener("oskar-logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("oskar-logout", handleLogoutEvent);
    };
  }, [pathname]);

  // Récupérer les catégories dynamiquement depuis l'API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log("🟡 Header - Fetching categories from API...");

        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        console.log("🟢 Header - Categories API raw response:", response);

        // ÉTAPE 1: Filtrer uniquement les catégories actives et non supprimées
        const activeCategories = response.filter(
          (category: Category) =>
            !category.is_deleted && category.deleted_at === null,
        );

        console.log("🟢 Header - Active categories:", activeCategories.length);

        // ÉTAPE 2: Identifier les catégories principales (sans parent ou path vide/null)
        const mainCategories = activeCategories.filter(
          (category: Category) =>
            !category.path || category.path === null || category.path === "",
        );

        console.log(
          "🟢 Header - Main categories found:",
          mainCategories.map((c: Category) => ({
            libelle: c.libelle,
            id: c.id,
            hasEnfants: c.enfants?.length || 0,
            enfants: c.enfants?.map((e: Category) => e.libelle) || [],
          })),
        );

        // ÉTAPE 3: Éliminer les doublons basés sur le libellé (garder la plus récente par ID)
        const uniqueCategoriesMap = new Map<string, Category>();

        mainCategories.forEach((category: Category) => {
          const existing = uniqueCategoriesMap.get(category.libelle);

          if (!existing) {
            uniqueCategoriesMap.set(category.libelle, category);
          } else {
            const existingId = existing.id || 0;
            const currentId = category.id || 0;

            // Garder la catégorie avec l'ID le plus élevé (la plus récente)
            if (currentId > existingId) {
              uniqueCategoriesMap.set(category.libelle, category);
            }
          }
        });

        const uniqueMainCategories = Array.from(uniqueCategoriesMap.values());
        console.log(
          "🟢 Header - Unique main categories after deduplication:",
          uniqueMainCategories.map((c: Category) => ({
            libelle: c.libelle,
            id: c.id,
            enfantsCount: c.enfants?.length || 0,
            enfants: c.enfants?.map((e: Category) => e.libelle) || [],
          })),
        );

        // ÉTAPE 4: Pour chaque catégorie principale, traiter les enfants
        const processedCategories = uniqueMainCategories.map(
          (category: Category) => {
            const enfants = category.enfants || [];

            const activeEnfants = enfants.filter(
              (enfant: Category) =>
                !enfant.is_deleted && enfant.deleted_at === null,
            );

            console.log(
              `🟢 Header - Category "${category.libelle}" has ${activeEnfants.length} active enfants:`,
              activeEnfants.map((e: Category) => ({
                libelle: e.libelle,
                slug: e.slug,
              })),
            );

            const uniqueChildrenMap = new Map<string, Category>();
            activeEnfants.forEach((enfant: Category) => {
              if (!uniqueChildrenMap.has(enfant.libelle)) {
                uniqueChildrenMap.set(enfant.libelle, enfant);
              } else {
                const existing = uniqueChildrenMap.get(enfant.libelle)!;
                if ((enfant.id || 0) > (existing.id || 0)) {
                  uniqueChildrenMap.set(enfant.libelle, enfant);
                }
              }
            });

            const uniqueChildren = Array.from(uniqueChildrenMap.values());

            return {
              uuid: category.uuid,
              libelle: category.libelle,
              slug: category.slug,
              type: category.type,
              description: category.description,
              image: category.image,
              enfants: uniqueChildren.map((enfant: Category) => ({
                uuid: enfant.uuid,
                libelle: enfant.libelle,
                slug: enfant.slug,
                type: enfant.type,
                description: enfant.description,
                image: enfant.image,
                id: enfant.id,
              })),
            };
          },
        );

        // ÉTAPE 5: Trier par libellé pour une navigation cohérente
        const sortedCategories = processedCategories.sort(
          (a: Category, b: Category) => a.libelle.localeCompare(b.libelle),
        );

        console.log(
          "🟢 Header - Final categories to display:",
          sortedCategories.map((c: Category) => ({
            libelle: c.libelle,
            slug: c.slug,
            enfants:
              c.enfants?.map((e: Category) => ({
                libelle: e.libelle,
                slug: e.slug,
              })) || [],
            enfantsCount: c.enfants?.length || 0,
          })),
        );

        setCategories(sortedCategories);
      } catch (error: any) {
        console.error("🔴 Header - Error loading categories:", error);
        setCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ÉCOUTER LES CHANGEMENTS DU CONTEXTE D'AUTHENTIFICATION
  useEffect(() => {
    console.log("🔵 Header - Auth context updated:", {
      isLoggedIn,
      user: user ? `${user.type}:${user.email}` : null,
    });

    if (isLoggedIn && user) {
      console.log("🟢 Header - User is logged in, setting context profile");
      setAvatarError(false);

      const immediateProfile: UserProfile = {
        uuid: user.uuid || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        type: user.type as any,
        nom_complet: user.nom_complet || "",
        avatar: user.avatar,
        avatar_key: (user as any).avatar_key,
        role: user.role,
        est_bloque: user.est_bloque,
        nom: user.nom,
        prenoms: user.prenoms,
      };

      console.log("🟢 Header - Setting immediate profile:", immediateProfile);
      setUserProfile(immediateProfile);

      const fetchFullProfile = async () => {
        try {
          setLoadingProfile(true);
          console.log("🟡 Header - Fetching full profile from API...");

          let endpoint = "";
          switch (user.type) {
            case "admin":
              endpoint = API_ENDPOINTS.AUTH.ADMIN.PROFILE;
              break;
            case "agent":
              endpoint = API_ENDPOINTS.AUTH.AGENT.PROFILE;
              break;
            case "vendeur":
              endpoint = API_ENDPOINTS.AUTH.VENDEUR.PROFILE;
              break;
            case "utilisateur":
              endpoint = API_ENDPOINTS.AUTH.UTILISATEUR.PROFILE;
              break;
          }

          if (endpoint) {
            const response = await api.get(endpoint);
            console.log("🟢 Header - Full profile API response:", response);

            let fullProfile: UserProfile;

            switch (user.type) {
              case "admin":
                fullProfile = {
                  uuid: response.data?.uuid || user.uuid || "",
                  email: response.data?.email || user.email || "",
                  nom: response.data?.nom || user.nom || "",
                  avatar: response.data?.avatar || user.avatar,
                  avatar_key:
                    response.data?.avatar_key || (user as any).avatar_key,
                  type: "admin",
                  role: response.data?.role || user.role || "admin",
                  isSuperAdmin: response.data?.isSuperAdmin || false,
                  nom_complet:
                    response.data?.nom_complet || user.nom_complet || "",
                };
                break;

              case "agent":
                fullProfile = {
                  uuid: response.data?.uuid || user.uuid || "",
                  email: response.data?.email || user.email || "",
                  nom: response.data?.nom || user.nom || "",
                  prenoms: response.data?.prenoms || user.prenoms || "",
                  avatar: response.data?.avatar || user.avatar,
                  avatar_key:
                    response.data?.avatar_key || (user as any).avatar_key,
                  type: "agent",
                  est_bloque: response.data?.est_bloque || false,
                };
                break;

              case "vendeur":
                fullProfile = {
                  uuid: response.data?.uuid || user.uuid || "",
                  email: response.data?.email || user.email || "",
                  nom: response.data?.nom || user.nom || "",
                  prenoms: response.data?.prenoms || user.prenoms || "",
                  avatar: response.data?.avatar || user.avatar,
                  avatar_key:
                    response.data?.avatar_key || (user as any).avatar_key,
                  type: "vendeur",
                  est_bloque: response.data?.est_bloque || false,
                  civilite: response.data?.civilité || user.civilite,
                };
                break;

              case "utilisateur":
                fullProfile = {
                  uuid: response.data?.uuid || user.uuid || "",
                  email: response.data?.email || user.email || "",
                  nom: response.data?.nom || user.nom || "",
                  prenoms: response.data?.prenoms || user.prenoms || "",
                  avatar: response.data?.avatar || user.avatar,
                  avatar_key:
                    response.data?.avatar_key || (user as any).avatar_key,
                  type: "utilisateur",
                  est_bloque: response.data?.est_bloque || false,
                  civilite: response.data?.civilite || user.civilite,
                };
                break;

              default:
                fullProfile = immediateProfile;
            }

            console.log("🟢 Header - Setting full profile data:", fullProfile);
            setUserProfile(fullProfile);
          }
        } catch (error) {
          console.error(
            "🔴 Header - Error fetching full profile, keeping context data",
            error,
          );
        } finally {
          setLoadingProfile(false);
        }
      };

      fetchFullProfile();
    } else {
      console.log("🔴 Header - No user in context, clearing profile");
      setUserProfile(null);
      setAvatarError(false);
      setLoadingProfile(false);
    }
  }, [isLoggedIn, user]);

  // ÉCOUTER LES ÉVÉNEMENTS PERSONNALISÉS POUR FORCER LES MISE À JOUR
  useEffect(() => {
    const handleForceUpdate = () => {
      console.log("🔄 Header - Force update triggered");
      setForceUpdate((prev) => prev + 1);
    };

    window.addEventListener(
      "auth-state-changed",
      handleForceUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "auth-state-changed",
        handleForceUpdate as EventListener,
      );
    };
  }, []);

  // Fermer les menus quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-menu-toggle")
      ) {
        setMobileMenuOpen(false);
      }

      const clickedInsideCategories = Object.values(
        categoriesDropdownRef.current,
      ).some((ref) => ref && ref.contains(event.target as Node));

      if (!clickedInsideCategories) {
        setCategoriesDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // HOOKS useCallback
  const handleLoginClick = useCallback(() => {
    closeModals();
    setTimeout(() => {
      openLoginModal();
    }, 100);
  }, [closeModals, openLoginModal]);

  const handlePublishClick = useCallback(() => {
    if (!isLoggedIn) {
      handleLoginClick();
      return;
    }
    setShowPublishModal(true);
  }, [isLoggedIn, handleLoginClick]);

  const handleLogout = useCallback(async () => {
    console.log("🔴 Header - Logging out...");

    try {
      // Appeler la méthode logout du contexte
      await logout();

      // Fermer tous les menus
      setDropdownOpen(false);
      setMobileMenuOpen(false);

      // Vider le profil utilisateur
      setUserProfile(null);
      setAvatarError(false);

      // Forcer une mise à jour
      setForceUpdate((prev) => prev + 1);

      // Déclencher un événement personnalisé pour notifier les autres composants
      const logoutEvent = new CustomEvent("oskar-logout", {
        detail: { timestamp: Date.now() },
      });
      window.dispatchEvent(logoutEvent);
    } catch (error) {
      console.error("🔴 Header - Error during logout:", error);
    }
  }, [logout]);

  const handleClosePublishModal = useCallback(() => {
    setShowPublishModal(false);
  }, []);

  const getUserInitials = useCallback(() => {
    const profile = user || userProfile;
    if (!profile) return "U";

    const firstName = profile.firstName || profile.prenoms || "";
    const lastName = profile.lastName || profile.nom || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    } else if (profile.nom_complet) {
      return profile.nom_complet.charAt(0).toUpperCase();
    }
    return "U";
  }, [user, userProfile]);

  const getUserFullName = useCallback(() => {
    const profile = user || userProfile;
    if (!profile) return "Utilisateur";

    if (profile.nom_complet) {
      return profile.nom_complet;
    }

    const firstName = profile.firstName || profile.prenoms || "";
    const lastName = profile.lastName || profile.nom || "";

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (profile.email) {
      return profile.email.split("@")[0];
    }
    return "Utilisateur";
  }, [user, userProfile]);

  const getUserDashboard = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    if (!userType) return "/dashboard";

    switch (userType) {
      case "admin":
        return "/dashboard-admin";
      case "agent":
        return "/dashboard-agent";
      case "vendeur":
        return "/dashboard-vendeur";
      case "utilisateur":
        return "/dashboard-utilisateur";
      default:
        return "/dashboard";
    }
  }, [user, userProfile]);

  const getUserProfileUrl = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    if (!userType) return "/mon-compte";

    switch (userType) {
      case "admin":
        return "/dashboard-admin/profile";
      case "agent":
        return "/dashboard-agent/profile";
      case "vendeur":
        return "/dashboard-vendeur/profile";
      case "utilisateur":
        return "/dashboard-utilisateur/profile";
      default:
        return "/mon-compte";
    }
  }, [user, userProfile]);

  const getUserAnnoncesUrl = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    if (!userType) return "/mes-annonces";

    switch (userType) {
      case "vendeur":
        return "/dashboard-vendeur/annonces/liste-annonces";
      case "utilisateur":
        return "/dashboard-utilisateur/annonces/liste-annonces";
      default:
        return "/mes-annonces";
    }
  }, [user, userProfile]);

  const getUserMessagesUrl = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    if (!userType) return "/messages";

    switch (userType) {
      case "admin":
        return "/dashboard-admin/messages";
      case "agent":
        return "/dashboard-agent/messages";
      case "vendeur":
        return "/dashboard-vendeur/messages";
      case "utilisateur":
        return "/dashboard-utilisateur/messages";
      default:
        return "/messages";
    }
  }, [user, userProfile]);

  const isVendeurOrUtilisateur = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    return userType === "vendeur" || userType === "utilisateur";
  }, [user, userProfile]);

  // ✅ Fonction getAvatarToDisplay améliorée avec buildImageUrl
  const getAvatarToDisplay = useCallback(() => {
    const profile = user || userProfile;
    if (!profile) return null;

    if (avatarError) return null;

    // Essayer d'abord avec avatar_key
    if ((profile as any).avatar_key) {
      const url = buildImageUrl((profile as any).avatar_key);
      if (url) return url;
    }

    // Sinon avec avatar
    if (profile.avatar) {
      const url = buildImageUrl(profile.avatar);
      if (url) return url;
    }

    return null;
  }, [user, userProfile, avatarError]);

  const getEmailToDisplay = useCallback(() => {
    return user?.email || userProfile?.email;
  }, [user, userProfile]);

  const getUserTypeToDisplay = useCallback(() => {
    return user?.type || userProfile?.type;
  }, [user, userProfile]);

  const getRoleToDisplay = useCallback(() => {
    return user?.role || userProfile?.role;
  }, [user, userProfile]);

  const toggleCategoryDropdown = useCallback((categorySlug: string) => {
    setCategoriesDropdownOpen((prev) =>
      prev === categorySlug ? null : categorySlug,
    );
  }, []);

  // GÉNÉRER LES LIENS DE NAVIGATION avec limitation responsive
  const generateNavLinks = (): NavLink[] => {
    const links: NavLink[] = [{ name: "Accueil", href: "/", exact: true }];

    if (!loadingCategories && categories.length > 0) {
      // Limiter le nombre de catégories affichées selon la taille d'écran
      let maxCategories = categories.length;
      if (isXs) maxCategories = 3;
      else if (isSm) maxCategories = 4;
      else if (isMd) maxCategories = 5;
      else if (isLg) maxCategories = 6;
      else maxCategories = categories.length;

      categories.slice(0, maxCategories).forEach((category: Category) => {
        const isDuplicate = links.some(
          (link) =>
            link.name === category.libelle ||
            link.href === `/categories/${category.slug}`,
        );

        if (!isDuplicate) {
          const mainLink: NavLink = {
            name: category.libelle,
            href: `/categories/${category.slug}`,
            exact: false,
            hasChildren: category.enfants && category.enfants.length > 0,
          };

          if (category.enfants && category.enfants.length > 0) {
            // Limiter le nombre d'enfants affichés selon la taille d'écran
            let maxChildren = category.enfants.length;
            if (isXs) maxChildren = 2;
            else if (isSm) maxChildren = 3;
            else if (isMd) maxChildren = 4;
            else maxChildren = category.enfants.length;

            const uniqueChildren = category.enfants
              .slice(0, maxChildren)
              .reduce((acc: any[], child: Category) => {
                const isChildDuplicate = acc.some(
                  (sub) => sub.name === child.libelle,
                );
                if (!isChildDuplicate) {
                  acc.push(child);
                }
                return acc;
              }, []);

            mainLink.children = uniqueChildren.map((child: Category) => ({
              name: child.libelle,
              href: `/categories/${category.slug}/${child.slug}`,
            }));
          }

          links.push(mainLink);
        }
      });
    }
    return links;
  };

  const navLinks = generateNavLinks();

  const isLinkActive = (link: NavLink) => {
    if (link.exact) {
      return pathname === link.href;
    }
    return pathname.startsWith(link.href);
  };

  const getLinkColor = (link: NavLink) => {
    if (isLinkActive(link)) {
      return colors.oskar.black;
    }
    return colors.oskar.grey;
  };

  console.log("🔄 Header - Rendering with state:", {
    isLoggedIn,
    userType: user?.type,
    hasUserProfile: !!userProfile,
    categoriesCount: categories.length,
    navLinksCount: navLinks.length,
    forceUpdate,
    headerKey,
    windowWidth,
    breakpoint: {
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
      isXxl,
      isMobile,
      isTablet,
      isDesktop,
    },
  });

  // Tailles responsives pour les différents éléments - DÉFINIES AVANT LEURS UTILISATIONS
  const logoSize = getResponsiveSize({
    xs: 28,
    sm: 32,
    md: 36,
    lg: 40,
    xl: 44,
    xxl: 48,
  });
  const logoFontSize = getResponsiveSize({
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 24,
  });
  const brandFontSize = getResponsiveSize({
    xs: 18,
    sm: 22,
    md: 28,
    lg: 32,
    xl: 36,
    xxl: 40,
  });
  const iconSize = getResponsiveSize({
    xs: 32,
    sm: 36,
    md: 40,
    lg: 44,
    xl: 48,
    xxl: 52,
  });
  const iconFontSize = getResponsiveSize({
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 24,
  });
  const buttonPadding = getResponsiveSize({
    xs: "0.25rem 0.5rem",
    sm: "0.3rem 0.75rem",
    md: "0.4rem 1rem",
    lg: "0.5rem 1.25rem",
    xl: "0.6rem 1.5rem",
    xxl: "0.7rem 1.75rem",
  });
  const buttonFontSize = getResponsiveSize({
    xs: 11,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
  });
  const navFontSize = getResponsiveSize({
    xs: 11,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
  });
  const containerPadding = getResponsiveSize({
    xs: 0.5,
    sm: 1,
    md: 1.5,
    lg: 2,
    xl: 2.5,
    xxl: 3,
  });

  // ✅ Gestionnaire d'erreur d'image amélioré - DÉFINI APRÈS LES VARIABLES DONT IL DÉPEND
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;

      // Si l'URL contient localhost, essayer de la corriger
      if (target.src.includes("localhost")) {
        const productionUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
          "https://oskar-api.mysonec.pro";
        target.src = target.src.replace(
          /http:\/\/localhost(:\d+)?/g,
          productionUrl,
        );
        return;
      }

      // Si l'URL contient des espaces, essayer de les nettoyer
      if (target.src.includes("%20")) {
        target.src = target.src.replace(/%20/g, "");
        return;
      }

      setAvatarError(true);
      target.style.display = "none";

      // Remplacer par les initiales
      const parent = target.parentElement;
      if (parent) {
        const initialsDiv = document.createElement("div");
        initialsDiv.className =
          "d-flex align-items-center justify-content-center w-100 h-100";
        initialsDiv.style.backgroundColor = colors.oskar.green;
        initialsDiv.style.color = "white";
        initialsDiv.style.fontSize = `${iconFontSize * 0.5}px`;
        initialsDiv.style.fontWeight = "bold";
        initialsDiv.textContent = getUserInitials();
        parent.innerHTML = "";
        parent.appendChild(initialsDiv);
      }
    },
    [getUserInitials, iconFontSize],
  );

  // DÉTERMINER SI C'EST UNE PAGE DASHBOARD APRÈS TOUS LES HOOKS
  const isDashboardPage = pathname.startsWith("/dashboard-");

  // NE PAS RENDRE LE HEADER SUR LES PAGES DASHBOARD
  if (isDashboardPage) {
    return null;
  }

  return (
    <>
      <header
        className="bg-white shadow-sm sticky-top"
        style={{ zIndex: 1000 }}
        key={headerKey}
      >
        <div className="container-fluid px-2 px-sm-3 px-md-4 px-lg-5">
          <div className="d-flex align-items-center justify-content-between py-2 py-md-3">
            {/* Logo et Bouton Menu Mobile */}
            <div className="d-flex align-items-center">
              {/* Bouton Menu Mobile - visible seulement sur mobile/tablette */}
              {isMobile && (
                <button
                  className="btn btn-link border-0 p-0 me-2 me-sm-3 d-lg-none mobile-menu-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                  type="button"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: iconFontSize,
                    width: iconSize,
                    height: iconSize,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <i
                    className={`fa-solid ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}
                    style={{ color: "inherit", fontSize: "inherit" }}
                  ></i>
                </button>
              )}

              {/* Logo - s'adapte à toutes les tailles */}
              <Link
                href="/"
                className="d-flex align-items-center text-decoration-none"
                aria-label="Accueil OSKAR"
              >
                <div
                  className="rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: logoSize,
                    height: logoSize,
                    backgroundColor: colors.oskar.green,
                    transition:
                      "background-color 0.3s, width 0.2s, height 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.oskar.greenHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.oskar.green;
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{ fontSize: logoFontSize }}
                  >
                    O
                  </span>
                </div>
                <span
                  className="fw-bold ms-1 ms-sm-2"
                  style={{
                    color: colors.oskar.black,
                    fontSize: brandFontSize,
                    transition: "font-size 0.2s",
                  }}
                >
                  OSKAR
                </span>
              </Link>

              {/* Navigation Desktop - visible seulement sur desktop */}
              {isDesktop && (
                <>
                  {loadingCategories ? (
                    <div className="d-flex align-items-center ms-4 ms-xl-5">
                      <div
                        className="skeleton-loader"
                        style={{
                          width: getResponsiveSize({ lg: 60, xl: 70, xxl: 80 }),
                          height: getResponsiveSize({
                            lg: 16,
                            xl: 18,
                            xxl: 20,
                          }),
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          marginRight: getResponsiveSize({
                            lg: 16,
                            xl: 20,
                            xxl: 24,
                          }),
                        }}
                      ></div>
                      <div
                        className="skeleton-loader"
                        style={{
                          width: getResponsiveSize({
                            lg: 80,
                            xl: 90,
                            xxl: 100,
                          }),
                          height: getResponsiveSize({
                            lg: 16,
                            xl: 18,
                            xxl: 20,
                          }),
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          marginRight: getResponsiveSize({
                            lg: 16,
                            xl: 20,
                            xxl: 24,
                          }),
                        }}
                      ></div>
                      <div
                        className="skeleton-loader"
                        style={{
                          width: getResponsiveSize({ lg: 50, xl: 60, xxl: 70 }),
                          height: getResponsiveSize({
                            lg: 16,
                            xl: 18,
                            xxl: 20,
                          }),
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                        }}
                      ></div>
                    </div>
                  ) : (
                    <nav className="d-flex align-items-center ms-4 ms-xl-5 position-relative">
                      {navLinks.map((link, index) => (
                        <div
                          key={`${link.name}-${index}`}
                          className="position-relative me-2 me-xl-3"
                          ref={(el) => {
                            if (link.hasChildren && link.name) {
                              categoriesDropdownRef.current[link.name] = el;
                            }
                          }}
                        >
                          <Link
                            href={link.href}
                            className="text-decoration-none position-relative d-flex align-items-center"
                            style={{
                              transition: "color 0.3s",
                              color: getLinkColor(link),
                              fontWeight: isLinkActive(link) ? "600" : "400",
                              fontSize: navFontSize,
                              whiteSpace: "nowrap",
                              padding: getResponsiveSize({
                                lg: "0.4rem 0",
                                xl: "0.45rem 0",
                                xxl: "0.5rem 0",
                              }),
                            }}
                            onMouseEnter={() => {
                              if (link.hasChildren) {
                                setCategoriesDropdownOpen(link.name);
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (
                                link.hasChildren &&
                                !categoriesDropdownRef.current[
                                  link.name
                                ]?.contains(e.relatedTarget as Node)
                              ) {
                                setCategoriesDropdownOpen(null);
                              }
                            }}
                          >
                            {link.name}
                            {link.hasChildren && (
                              <i
                                className="fa-solid fa-chevron-down ms-1"
                                style={{
                                  fontSize: getResponsiveSize({
                                    lg: 9,
                                    xl: 10,
                                    xxl: 11,
                                  }),
                                }}
                              ></i>
                            )}
                            {isLinkActive(link) && !link.hasChildren && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-6px",
                                  left: "0",
                                  width: "100%",
                                  height: "2px",
                                  backgroundColor: colors.oskar.green,
                                  borderRadius: "2px",
                                }}
                              />
                            )}
                          </Link>

                          {/* Sous-menu déroulant */}
                          {link.hasChildren &&
                            link.children &&
                            categoriesDropdownOpen === link.name && (
                              <div
                                className="dropdown-menu shadow border-0 show position-absolute"
                                style={{
                                  minWidth: getResponsiveSize({
                                    lg: 180,
                                    xl: 200,
                                    xxl: 220,
                                  }),
                                  marginTop: "0",
                                  top: "100%",
                                  left: "0",
                                  zIndex: 1001,
                                  borderRadius: "8px",
                                  padding: "0.5rem 0",
                                }}
                                onMouseEnter={() =>
                                  setCategoriesDropdownOpen(link.name)
                                }
                                onMouseLeave={() =>
                                  setCategoriesDropdownOpen(null)
                                }
                              >
                                {link.children.map((child, childIndex) => (
                                  <Link
                                    key={`${child.name}-${childIndex}`}
                                    href={child.href}
                                    className="dropdown-item py-2 px-3"
                                    style={{
                                      fontSize: navFontSize * 0.9,
                                      color: colors.oskar.grey,
                                      transition: "all 0.2s",
                                      minHeight: getResponsiveSize({
                                        lg: 36,
                                        xl: 38,
                                        xxl: 40,
                                      }),
                                    }}
                                    onClick={() =>
                                      setCategoriesDropdownOpen(null)
                                    }
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color =
                                        colors.oskar.green;
                                      e.currentTarget.style.backgroundColor =
                                        "#f8f9fa";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color =
                                        colors.oskar.grey;
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </nav>
                  )}
                </>
              )}
            </div>

            {/* Actions Desktop - visible seulement sur desktop */}
            {isDesktop && (
              <div className="d-flex align-items-center">
                {/* Icône Messagerie */}
                <Link href={isLoggedIn ? getUserMessagesUrl() : "#"}>
                  <button
                    className="btn btn-link border-0 position-relative me-2 me-xl-3"
                    style={{
                      transition: "color 0.3s",
                      fontSize: iconFontSize,
                      color:
                        pathname.includes("/messages") ||
                        pathname.includes("/messagerie")
                          ? colors.oskar.green
                          : colors.oskar.grey,
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        pathname.includes("/messages") ||
                        pathname.includes("/messagerie")
                          ? colors.oskar.green
                          : colors.oskar.grey;
                    }}
                    aria-label="Messagerie"
                    type="button"
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        handleLoginClick();
                      }
                    }}
                  >
                    <i className="fa-solid fa-envelope"></i>
                    {unreadMessagesCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                        style={{
                          backgroundColor: colors.oskar.orange || "#ff6b35",
                          color: "white",
                          fontSize: getResponsiveSize({
                            lg: 9,
                            xl: 10,
                            xxl: 11,
                          }),
                          minWidth: getResponsiveSize({
                            lg: 16,
                            xl: 17,
                            xxl: 18,
                          }),
                          height: getResponsiveSize({
                            lg: 16,
                            xl: 17,
                            xxl: 18,
                          }),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                          fontWeight: "bold",
                          transform: "translate(-30%, -25%)",
                        }}
                      >
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Icône Téléphone/Contact */}
                <Link href="/contact">
                  <button
                    className="btn btn-link border-0 me-2 me-xl-3"
                    style={{
                      transition: "color 0.3s",
                      fontSize: iconFontSize,
                      color:
                        pathname === "/contact"
                          ? colors.oskar.green
                          : colors.oskar.grey,
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        pathname === "/contact"
                          ? colors.oskar.green
                          : colors.oskar.grey;
                    }}
                    aria-label="Contact"
                    type="button"
                  >
                    <i className="fa-solid fa-phone"></i>
                  </button>
                </Link>

                {/* Icône Favoris */}
                <Link href="/liste-favoris">
                  <button
                    className="btn btn-link border-0 me-3 me-xl-4"
                    style={{
                      transition: "color 0.3s",
                      fontSize: iconFontSize,
                      color:
                        pathname === "/liste-favoris"
                          ? colors.oskar.green
                          : colors.oskar.grey,
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        pathname === "/liste-favoris"
                          ? colors.oskar.green
                          : colors.oskar.grey;
                    }}
                    aria-label="Favoris"
                    type="button"
                  >
                    <i className="fa-solid fa-heart"></i>
                  </button>
                </Link>

                {/* Compte utilisateur */}
                {isLoggedIn ? (
                  <div
                    className="dropdown"
                    ref={dropdownRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-link border-0 d-flex align-items-center text-decoration-none p-0"
                      style={{
                        color: colors.oskar.grey,
                        transition: "color 0.3s",
                        background: "none",
                      }}
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.oskar.green;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.oskar.grey;
                      }}
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      {loadingProfile ? (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: iconSize,
                            height: iconSize,
                            backgroundColor: "#f3f4f6",
                          }}
                        >
                          <div
                            className="spinner-border spinner-border-sm text-success"
                            role="status"
                          >
                            <span className="visually-hidden">
                              Chargement...
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="rounded-circle overflow-hidden"
                          style={{
                            width: iconSize,
                            height: iconSize,
                            border: `2px solid ${colors.oskar.green}`,
                          }}
                        >
                          {getAvatarToDisplay() ? (
                            <img
                              src={getAvatarToDisplay()!}
                              alt={getUserFullName()}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={handleImageError}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center w-100 h-100"
                              style={{
                                backgroundColor: colors.oskar.green,
                                color: "white",
                                fontSize: iconFontSize * 0.5,
                                fontWeight: "bold",
                              }}
                            >
                              {getUserInitials()}
                            </div>
                          )}
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div
                        className="dropdown-menu dropdown-menu-end shadow border-0 show"
                        style={{
                          minWidth: getResponsiveSize({
                            lg: 280,
                            xl: 300,
                            xxl: 320,
                          }),
                          maxWidth: getResponsiveSize({
                            lg: 320,
                            xl: 350,
                            xxl: 380,
                          }),
                          marginTop: "0.5rem",
                        }}
                      >
                        <div className="p-3 border-bottom">
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle overflow-hidden me-3 flex-shrink-0"
                              style={{
                                width: getResponsiveSize({
                                  lg: 44,
                                  xl: 48,
                                  xxl: 52,
                                }),
                                height: getResponsiveSize({
                                  lg: 44,
                                  xl: 48,
                                  xxl: 52,
                                }),
                                border: `2px solid ${colors.oskar.green}`,
                              }}
                            >
                              {getAvatarToDisplay() ? (
                                <img
                                  src={getAvatarToDisplay()!}
                                  alt={getUserFullName()}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onError={handleImageError}
                                />
                              ) : (
                                <div
                                  className="d-flex align-items-center justify-content-center w-100 h-100"
                                  style={{
                                    backgroundColor: colors.oskar.green,
                                    color: "white",
                                    fontSize: getResponsiveSize({
                                      lg: 14,
                                      xl: 15,
                                      xxl: 16,
                                    }),
                                    fontWeight: "bold",
                                  }}
                                >
                                  {getUserInitials()}
                                </div>
                              )}
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <h6
                                className="fw-bold mb-0 text-truncate"
                                style={{
                                  fontSize: getResponsiveSize({
                                    lg: 13,
                                    xl: 14,
                                    xxl: 15,
                                  }),
                                }}
                                title={getUserFullName()}
                              >
                                {getUserFullName()}
                              </h6>
                              {getEmailToDisplay() && (
                                <small
                                  className="text-muted d-block text-truncate"
                                  style={{
                                    fontSize: getResponsiveSize({
                                      lg: 11,
                                      xl: 12,
                                      xxl: 13,
                                    }),
                                  }}
                                  title={getEmailToDisplay()}
                                >
                                  {getEmailToDisplay()}
                                </small>
                              )}
                              <small
                                className="text-muted d-block"
                                style={{
                                  fontSize: getResponsiveSize({
                                    lg: 10,
                                    xl: 11,
                                    xxl: 12,
                                  }),
                                }}
                              >
                                {getUserTypeToDisplay() === "admin" &&
                                  "Administrateur"}
                                {getUserTypeToDisplay() === "agent" && "Agent"}
                                {getUserTypeToDisplay() === "vendeur" &&
                                  "Vendeur"}
                                {getUserTypeToDisplay() === "utilisateur" &&
                                  "Utilisateur"}
                                {getRoleToDisplay() &&
                                  ` • ${getRoleToDisplay()}`}
                              </small>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            href={getUserDashboard()}
                            className="dropdown-item d-flex align-items-center py-2 px-3"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              fontSize: getResponsiveSize({
                                lg: 12,
                                xl: 13,
                                xxl: 14,
                              }),
                              minHeight: getResponsiveSize({
                                lg: 36,
                                xl: 38,
                                xxl: 40,
                              }),
                            }}
                          >
                            <i
                              className="fa-solid fa-chart-line me-3 text-muted flex-shrink-0"
                              style={{
                                width: getResponsiveSize({
                                  lg: 16,
                                  xl: 18,
                                  xxl: 20,
                                }),
                              }}
                            ></i>
                            <span className="flex-grow-1">Dashboard</span>
                          </Link>

                          <Link
                            href={getUserProfileUrl()}
                            className="dropdown-item d-flex align-items-center py-2 px-3"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              fontSize: getResponsiveSize({
                                lg: 12,
                                xl: 13,
                                xxl: 14,
                              }),
                              minHeight: getResponsiveSize({
                                lg: 36,
                                xl: 38,
                                xxl: 40,
                              }),
                            }}
                          >
                            <i
                              className="fa-solid fa-user me-3 text-muted flex-shrink-0"
                              style={{
                                width: getResponsiveSize({
                                  lg: 16,
                                  xl: 18,
                                  xxl: 20,
                                }),
                              }}
                            ></i>
                            <span className="flex-grow-1">Mon profil</span>
                          </Link>

                          {isVendeurOrUtilisateur() && (
                            <Link
                              href={getUserAnnoncesUrl()}
                              className="dropdown-item d-flex align-items-center py-2 px-3"
                              onClick={() => setDropdownOpen(false)}
                              style={{
                                fontSize: getResponsiveSize({
                                  lg: 12,
                                  xl: 13,
                                  xxl: 14,
                                }),
                                minHeight: getResponsiveSize({
                                  lg: 36,
                                  xl: 38,
                                  xxl: 40,
                                }),
                              }}
                            >
                              <i
                                className="fa-solid fa-newspaper me-3 text-muted flex-shrink-0"
                                style={{
                                  width: getResponsiveSize({
                                    lg: 16,
                                    xl: 18,
                                    xxl: 20,
                                  }),
                                }}
                              ></i>
                              <span className="flex-grow-1">Mes annonces</span>
                            </Link>
                          )}

                          <Link
                            href={getUserMessagesUrl()}
                            className="dropdown-item d-flex align-items-center py-2 px-3"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              fontSize: getResponsiveSize({
                                lg: 12,
                                xl: 13,
                                xxl: 14,
                              }),
                              minHeight: getResponsiveSize({
                                lg: 36,
                                xl: 38,
                                xxl: 40,
                              }),
                            }}
                          >
                            <i
                              className="fa-solid fa-envelope me-3 text-muted flex-shrink-0"
                              style={{
                                width: getResponsiveSize({
                                  lg: 16,
                                  xl: 18,
                                  xxl: 20,
                                }),
                              }}
                            ></i>
                            <span className="flex-grow-1">Messages</span>
                            {unreadMessagesCount > 0 && (
                              <span
                                className="badge bg-danger ms-auto flex-shrink-0"
                                style={{
                                  fontSize: getResponsiveSize({
                                    lg: 9,
                                    xl: 10,
                                    xxl: 11,
                                  }),
                                  padding: "0.2rem 0.4rem",
                                  minWidth: "1.5rem",
                                }}
                              >
                                {unreadMessagesCount > 9
                                  ? "9+"
                                  : unreadMessagesCount}
                              </span>
                            )}
                          </Link>

                          <div className="dropdown-divider my-2"></div>
                          <button
                            className="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                            onClick={handleLogout}
                            type="button"
                            style={{
                              fontSize: getResponsiveSize({
                                lg: 12,
                                xl: 13,
                                xxl: 14,
                              }),
                              minHeight: getResponsiveSize({
                                lg: 36,
                                xl: 38,
                                xxl: 40,
                              }),
                            }}
                          >
                            <i
                              className="fa-solid fa-right-from-bracket me-3 flex-shrink-0"
                              style={{
                                width: getResponsiveSize({
                                  lg: 16,
                                  xl: 18,
                                  xxl: 20,
                                }),
                              }}
                            ></i>
                            <span className="flex-grow-1">Déconnexion</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className="btn btn-link border-0"
                    style={{
                      transition: "color 0.3s",
                      fontSize: iconFontSize,
                      color: colors.oskar.grey,
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    aria-label="Se connecter"
                    onClick={handleLoginClick}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.oskar.green;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.oskar.grey;
                    }}
                    type="button"
                  >
                    <i className="fa-solid fa-user"></i>
                  </button>
                )}

                {/* Bouton Publier */}
                <button
                  className="btn d-flex align-items-center ms-3 ms-xl-4"
                  style={{
                    backgroundColor:
                      hoveredButton === "publish"
                        ? colors.oskar.greenHover
                        : colors.oskar.green,
                    color: "white",
                    padding: buttonPadding,
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    transition: "background-color 0.3s",
                    fontSize: buttonFontSize,
                    whiteSpace: "nowrap",
                    minHeight: getResponsiveSize({ lg: 36, xl: 40, xxl: 44 }),
                  }}
                  onMouseEnter={() => setHoveredButton("publish")}
                  onMouseLeave={() => setHoveredButton(null)}
                  aria-label="Publier une annonce"
                  onClick={handlePublishClick}
                  type="button"
                >
                  <i className="fa-solid fa-plus me-2"></i>
                  <span>Publier</span>
                </button>
              </div>
            )}

            {/* Actions Mobile/Tablette - visible sur < 992px */}
            {isMobile && (
              <div className="d-flex align-items-center">
                {/* Icône Messagerie Mobile */}
                <Link href={isLoggedIn ? getUserMessagesUrl() : "#"}>
                  <button
                    className="btn btn-link border-0 position-relative"
                    style={{
                      color: colors.oskar.grey,
                      fontSize: iconFontSize * 0.9,
                      width: iconSize * 0.9,
                      height: iconSize * 0.9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    aria-label="Messagerie"
                    type="button"
                    onClick={(e) => {
                      if (!isLoggedIn) {
                        e.preventDefault();
                        handleLoginClick();
                      }
                    }}
                  >
                    <i className="fa-solid fa-envelope"></i>
                    {unreadMessagesCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                        style={{
                          backgroundColor: colors.oskar.orange || "#ff6b35",
                          color: "white",
                          fontSize: getResponsiveSize({ xs: 7, sm: 8, md: 9 }),
                          minWidth: getResponsiveSize({
                            xs: 10,
                            sm: 12,
                            md: 14,
                          }),
                          height: getResponsiveSize({ xs: 10, sm: 12, md: 14 }),
                          transform: "translate(-30%, -25%)",
                        }}
                      >
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    )}
                  </button>
                </Link>

                {/* Icône Favoris Mobile - visible sur tablettes et grands mobiles */}
                {!isXs && (
                  <Link href="/liste-favoris">
                    <button
                      className="btn btn-link border-0"
                      style={{
                        color: colors.oskar.grey,
                        fontSize: iconFontSize * 0.9,
                        width: iconSize * 0.9,
                        height: iconSize * 0.9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      aria-label="Favoris"
                      type="button"
                    >
                      <i className="fa-solid fa-heart"></i>
                    </button>
                  </Link>
                )}

                {/* Icône Téléphone/Contact Mobile - visible sur tablettes et grands mobiles */}
                {!isXs && (
                  <Link href="/contact">
                    <button
                      className="btn btn-link border-0"
                      style={{
                        color: colors.oskar.grey,
                        fontSize: iconFontSize * 0.9,
                        width: iconSize * 0.9,
                        height: iconSize * 0.9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      aria-label="Contact"
                      type="button"
                    >
                      <i className="fa-solid fa-phone"></i>
                    </button>
                  </Link>
                )}

                {/* Bouton Publier Mobile - version compacte */}
                <button
                  className="btn ms-1"
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    padding: getResponsiveSize({
                      xs: "0.2rem 0.4rem",
                      sm: "0.25rem 0.5rem",
                      md: "0.3rem 0.6rem",
                    }),
                    borderRadius: "6px",
                    fontSize: buttonFontSize * 0.8,
                    border: "none",
                    minWidth: "auto",
                    whiteSpace: "nowrap",
                    minHeight: getResponsiveSize({ xs: 28, sm: 32, md: 36 }),
                  }}
                  onClick={handlePublishClick}
                  aria-label="Publier"
                  type="button"
                >
                  <i className="fa-solid fa-plus"></i>
                  {!isXs && <span className="ms-1">Publier</span>}
                </button>
              </div>
            )}
          </div>

          {/* Barre de navigation mobile défilante - visible sur tablette et mobile */}
          {isMobile && !loadingCategories && categories.length > 0 && (
            <div className="border-top">
              <div className="scrollable-nav py-2 px-1">
                <div
                  className="d-flex overflow-auto hide-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    gap: getResponsiveSize({ xs: 2, sm: 4, md: 6 }),
                  }}
                >
                  {navLinks.map((link, index) => (
                    <Link
                      key={`${link.name}-${index}-mobile`}
                      href={link.href}
                      className={`text-decoration-none px-2 px-sm-3 py-1 ${isLinkActive(link) ? "fw-semibold" : ""}`}
                      style={{
                        color: isLinkActive(link)
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        whiteSpace: "nowrap",
                        borderBottom: isLinkActive(link)
                          ? `2px solid ${colors.oskar.green}`
                          : "2px solid transparent",
                        fontSize: getResponsiveSize({ xs: 11, sm: 12, md: 13 }),
                        padding: getResponsiveSize({
                          xs: "0.15rem 0.4rem",
                          sm: "0.2rem 0.5rem",
                          md: "0.25rem 0.75rem",
                        }),
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Menu Mobile Plein Écran */}
      {mobileMenuOpen && isMobile && (
        <div className="d-lg-none">
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 999 }}
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            ref={mobileMenuRef}
            className="position-fixed top-0 start-0 h-100 bg-white shadow-lg"
            style={{
              width: getResponsiveSize({ xs: "85%", sm: "80%", md: "70%" }),
              maxWidth: "320px",
              zIndex: 1000,
              overflowY: "auto",
            }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center">
                <div
                  className="rounded d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: getResponsiveSize({ xs: 28, sm: 32, md: 36 }),
                    height: getResponsiveSize({ xs: 28, sm: 32, md: 36 }),
                    backgroundColor: colors.oskar.green,
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{
                      fontSize: getResponsiveSize({ xs: 12, sm: 14, md: 16 }),
                    }}
                  >
                    O
                  </span>
                </div>
                <span
                  className="fw-bold"
                  style={{
                    color: colors.oskar.black,
                    fontSize: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                  }}
                >
                  OSKAR
                </span>
              </div>
              <button
                className="btn btn-link p-0"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                type="button"
              >
                <i
                  className="fa-solid fa-times"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                  }}
                ></i>
              </button>
            </div>

            <div className="p-2">
              {navLinks.map((link, index) => (
                <div key={`${link.name}-${index}-mobile-menu`}>
                  <Link
                    href={link.href}
                    className={`d-flex align-items-center justify-content-between py-2 py-sm-3 px-3 text-decoration-none`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: isLinkActive(link)
                        ? colors.oskar.green
                        : colors.oskar.grey,
                      borderLeft: isLinkActive(link)
                        ? `4px solid ${colors.oskar.green}`
                        : "4px solid transparent",
                      fontSize: getResponsiveSize({ xs: 13, sm: 14, md: 15 }),
                      minHeight: getResponsiveSize({ xs: 36, sm: 40, md: 44 }),
                    }}
                  >
                    <span className={isLinkActive(link) ? "fw-semibold" : ""}>
                      {link.name}
                    </span>
                    {link.hasChildren && (
                      <i
                        className="fa-solid fa-chevron-down text-muted"
                        style={{
                          fontSize: getResponsiveSize({
                            xs: 10,
                            sm: 11,
                            md: 12,
                          }),
                        }}
                      ></i>
                    )}
                  </Link>

                  {link.hasChildren && link.children && (
                    <div className="ps-4">
                      {link.children.map((child, childIndex) => (
                        <Link
                          key={`${child.name}-${childIndex}`}
                          href={child.href}
                          className="d-block py-2 px-3 text-decoration-none"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            color: colors.oskar.grey,
                            fontSize: getResponsiveSize({
                              xs: 12,
                              sm: 13,
                              md: 14,
                            }),
                            minHeight: getResponsiveSize({
                              xs: 32,
                              sm: 36,
                              md: 40,
                            }),
                          }}
                        >
                          <i
                            className="fa-solid fa-angle-right me-2"
                            style={{
                              fontSize: getResponsiveSize({
                                xs: 9,
                                sm: 10,
                                md: 11,
                              }),
                            }}
                          ></i>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoggedIn && (
                <div className="mt-4 border-top pt-3">
                  <div className="px-3 mb-2">
                    <small
                      className="text-muted"
                      style={{
                        fontSize: getResponsiveSize({ xs: 10, sm: 11, md: 12 }),
                      }}
                    >
                      Mon compte
                    </small>
                  </div>

                  <Link
                    href={getUserDashboard()}
                    className="d-flex align-items-center py-2 py-sm-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: getResponsiveSize({ xs: 13, sm: 14, md: 15 }),
                      minHeight: getResponsiveSize({ xs: 36, sm: 40, md: 44 }),
                    }}
                  >
                    <i
                      className="fa-solid fa-chart-line me-3"
                      style={{
                        width: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                      }}
                    ></i>
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href={getUserProfileUrl()}
                    className="d-flex align-items-center py-2 py-sm-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: getResponsiveSize({ xs: 13, sm: 14, md: 15 }),
                      minHeight: getResponsiveSize({ xs: 36, sm: 40, md: 44 }),
                    }}
                  >
                    <i
                      className="fa-solid fa-user me-3"
                      style={{
                        width: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                      }}
                    ></i>
                    <span>Mon profil</span>
                  </Link>

                  {isVendeurOrUtilisateur() && (
                    <Link
                      href={getUserAnnoncesUrl()}
                      className="d-flex align-items-center py-2 py-sm-3 px-3 text-decoration-none"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        color: colors.oskar.grey,
                        fontSize: getResponsiveSize({ xs: 13, sm: 14, md: 15 }),
                        minHeight: getResponsiveSize({
                          xs: 36,
                          sm: 40,
                          md: 44,
                        }),
                      }}
                    >
                      <i
                        className="fa-solid fa-newspaper me-3"
                        style={{
                          width: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                        }}
                      ></i>
                      <span>Mes annonces</span>
                    </Link>
                  )}

                  <Link
                    href={getUserMessagesUrl()}
                    className="d-flex align-items-center py-2 py-sm-3 px-3 text-decoration-none position-relative"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: getResponsiveSize({ xs: 13, sm: 14, md: 15 }),
                      minHeight: getResponsiveSize({ xs: 36, sm: 40, md: 44 }),
                    }}
                  >
                    <i
                      className="fa-solid fa-envelope me-3"
                      style={{
                        width: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                      }}
                    ></i>
                    <span>Messages</span>
                    {unreadMessagesCount > 0 && (
                      <span
                        className="position-absolute end-3 badge bg-danger"
                        style={{
                          fontSize: getResponsiveSize({ xs: 8, sm: 9, md: 10 }),
                          padding: "0.2rem 0.4rem",
                        }}
                      >
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>

                  <button
                    className="d-flex align-items-center py-2 py-sm-3 px-3 w-100 text-start border-0 bg-transparent text-danger"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                    style={{
                      fontSize: getResponsiveSize({ xs: 13, sm: 14, md: 15 }),
                      minHeight: getResponsiveSize({ xs: 36, sm: 40, md: 44 }),
                    }}
                  >
                    <i
                      className="fa-solid fa-right-from-bracket me-3"
                      style={{
                        width: getResponsiveSize({ xs: 16, sm: 18, md: 20 }),
                      }}
                    ></i>
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

              <div className="p-3 mt-3">
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    padding: getResponsiveSize({
                      xs: "0.4rem",
                      sm: "0.5rem",
                      md: "0.6rem",
                    }),
                    fontSize: getResponsiveSize({ xs: 12, sm: 13, md: 14 }),
                  }}
                  onClick={() => {
                    handlePublishClick();
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  <i className="fa-solid fa-plus me-2"></i>
                  Publier une annonce
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublishAdModal
        visible={showPublishModal}
        onHide={handleClosePublishModal}
        isLoggedIn={isLoggedIn}
        onLoginRequired={() => {
          handleClosePublishModal();
          handleLoginClick();
        }}
      />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .dropdown-menu {
          max-height: calc(100vh - 100px);
          overflow-y: auto;
        }
        .dropdown-item {
          min-height: ${getResponsiveSize({
            xs: 36,
            sm: 38,
            md: 40,
            lg: 42,
            xl: 44,
            xxl: 46,
          })}px;
          display: flex;
          align-items: center;
        }
        .dropdown-menu {
          animation: fadeIn 0.2s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .skeleton-loader {
          animation: skeleton-loading 1.5s ease-in-out infinite;
        }
        @keyframes skeleton-loading {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }

        /* Optimisations responsives */
        @media (max-width: 375px) {
          .btn-link {
            min-width: auto !important;
          }
          .container-fluid {
            padding-left: 0.25rem !important;
            padding-right: 0.25rem !important;
          }
        }

        @media (min-width: 376px) and (max-width: 575px) {
          .container-fluid {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }
        }

        @media (min-width: 576px) and (max-width: 767px) {
          .container-fluid {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }

        @media (min-width: 768px) and (max-width: 991px) {
          .container-fluid {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }

        @media (min-width: 992px) and (max-width: 1199px) {
          .container-fluid {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
        }

        @media (min-width: 1200px) and (max-width: 1399px) {
          .container-fluid {
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }
        }

        @media (min-width: 1400px) {
          .container-fluid {
            max-width: 1400px;
            padding-left: 2.5rem !important;
            padding-right: 2.5rem !important;
          }
        }

        /* Amélioration du touch pour mobile */
        @media (max-width: 991px) {
          .btn,
          .dropdown-item,
          .nav-link {
            min-height: 44px;
            display: flex;
            align-items: center;
          }

          button,
          a {
            touch-action: manipulation;
          }
        }

        /* Optimisation pour les très grands écrans */
        @media (min-width: 1600px) {
          .container-fluid {
            max-width: 1600px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
