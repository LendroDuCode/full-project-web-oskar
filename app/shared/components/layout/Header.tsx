"use client";

import Link from "next/link";
import { FC, useState, useRef, useEffect, useCallback } from "react";
import colors from "../../constants/colors";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/(front-office)/auth/AuthContext";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import PublishAdModal from "@/app/(front-office)/publication-annonce/page";
import { api } from "@/lib/api-client";
import { buildImageUrl } from "../../utils/image-utils";

// ============================================
// FONCTION POUR LE FALLBACK AVATAR
// ============================================
const getDefaultAvatar = (nom: string = "U", size: number = 40) => {
  const initials = nom ? nom.charAt(0).toUpperCase() : "U";
  return `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=${size}`;
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
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  const { isLoggedIn, user, logout, openLoginModal, closeModals } = useAuth();

  const headerKey = `header-${isLoggedIn ? "logged-in" : "logged-out"}-${user?.type || "none"}-${user?.uuid?.substring(0, 8) || "none"}-${forceUpdate}`;

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

        // ÉTAPE 3: Éliminer les doublons basés sur le libellé
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

  // ✅ FONCTION AVEC buildImageUrl CENTRALISÉ - CORRIGÉE POUR NE JAMAIS RETOURNER NULL
  const getAvatarUrl = useCallback((): string => {
    if (!userProfile?.avatar || avatarError) {
      return getDefaultAvatar(
        user?.nom ||
          user?.prenoms ||
          userProfile?.nom ||
          userProfile?.prenoms ||
          "U",
        40,
      );
    }
    const url = buildImageUrl(userProfile.avatar);
    return (
      url ||
      getDefaultAvatar(
        user?.nom ||
          user?.prenoms ||
          userProfile?.nom ||
          userProfile?.prenoms ||
          "U",
        40,
      )
    );
  }, [userProfile, user, avatarError]);

  // ✅ GESTIONNAIRE D'ERREUR D'IMAGE
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      console.log("🖼️ Erreur de chargement d'image, fallback aux initiales");
      setAvatarError(true);
    },
    [],
  );

  // ✅ DEBUG - Afficher l'URL
  useEffect(() => {
    if (isLoggedIn && (user || userProfile)) {
      console.log("🔍 Avatar URL:", getAvatarUrl());
      console.log("🔍 Avatar brut:", user?.avatar || userProfile?.avatar);
      console.log(
        "🔍 Avatar_key:",
        (user as any)?.avatar_key || (userProfile as any)?.avatar_key,
      );
    }
  }, [isLoggedIn, user, userProfile, getAvatarUrl]);

  // ✅ AUTRES CALLBACKS
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
      await logout();

      setDropdownOpen(false);
      setMobileMenuOpen(false);
      setUserProfile(null);
      setAvatarError(false);
      setForceUpdate((prev) => prev + 1);

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
      // Limiter le nombre de catégories affichées en fonction de la largeur d'écran
      const categoriesToShow = categories.slice(0, 7);

      categoriesToShow.forEach((category: Category) => {
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
            // Limiter le nombre de sous-catégories
            const childrenToShow = category.enfants.slice(0, 5);

            mainLink.children = childrenToShow.map((child: Category) => ({
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
  });

  // DÉTERMINER SI C'EST UNE PAGE DASHBOARD
  const isDashboardPage = pathname.startsWith("/dashboard-");

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
              <button
                className="btn btn-link border-0 p-0 me-2 me-sm-3 d-lg-none mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                type="button"
                style={{
                  color: colors.oskar.grey,
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  width: "clamp(32px, 5vw, 40px)",
                  height: "clamp(32px, 5vw, 40px)",
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

              <Link
                href="/"
                className="d-flex align-items-center text-decoration-none"
                aria-label="Accueil OSKAR"
              >
                <div
                  className="rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "clamp(32px, 5vw, 48px)",
                    height: "clamp(32px, 5vw, 48px)",
                    backgroundColor: colors.oskar.green,
                    transition: "background-color 0.3s",
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
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1.25rem)" }}
                  >
                    O
                  </span>
                </div>
                <span
                  className="fw-bold ms-1 ms-sm-2"
                  style={{
                    color: colors.oskar.black,
                    fontSize: "clamp(1rem, 3vw, 1.75rem)",
                    transition: "font-size 0.2s",
                  }}
                >
                  OSKAR
                </span>
              </Link>

              {/* Navigation Desktop */}
              <nav className="d-none d-lg-flex align-items-center ms-4 ms-xl-5 position-relative flex-wrap">
                {loadingCategories ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="skeleton-loader" style={{ width: "60px", height: "20px" }}></div>
                    <div className="skeleton-loader" style={{ width: "80px", height: "20px" }}></div>
                    <div className="skeleton-loader" style={{ width: "50px", height: "20px" }}></div>
                  </div>
                ) : (
                  navLinks.map((link, index) => (
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
                          fontSize: "clamp(0.75rem, 1vw, 0.875rem)",
                          whiteSpace: "nowrap",
                          padding: "0.5rem 0",
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
                            style={{ fontSize: "0.625rem" }}
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

                      {link.hasChildren &&
                        link.children &&
                        categoriesDropdownOpen === link.name && (
                          <div
                            className="dropdown-menu shadow border-0 show position-absolute"
                            style={{
                              minWidth: "200px",
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
                                  fontSize: "0.875rem",
                                  color: colors.oskar.grey,
                                  transition: "all 0.2s",
                                  minHeight: "40px",
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
                  ))
                )}
              </nav>
            </div>

            {/* Actions Desktop */}
            <div className="d-none d-lg-flex align-items-center">
              <Link href={isLoggedIn ? getUserMessagesUrl() : "#"}>
                <button
                  className="btn btn-link border-0 position-relative me-2 me-xl-3"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                    color:
                      pathname.includes("/messages") ||
                      pathname.includes("/messagerie")
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "clamp(36px, 3vw, 44px)",
                    height: "clamp(36px, 3vw, 44px)",
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
                        fontSize: "0.625rem",
                        minWidth: "16px",
                        height: "16px",
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

              <Link href="/contact">
                <button
                  className="btn btn-link border-0 me-2 me-xl-3"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                    color:
                      pathname === "/contact"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "clamp(36px, 3vw, 44px)",
                    height: "clamp(36px, 3vw, 44px)",
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

              <Link href="/liste-favoris">
                <button
                  className="btn btn-link border-0 me-3 me-xl-4"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                    color:
                      pathname === "/liste-favoris"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "clamp(36px, 3vw, 44px)",
                    height: "clamp(36px, 3vw, 44px)",
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
                          width: "clamp(36px, 3vw, 44px)",
                          height: "clamp(36px, 3vw, 44px)",
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
                        className="rounded-circle overflow-hidden position-relative"
                        style={{
                          width: "clamp(36px, 3vw, 44px)",
                          height: "clamp(36px, 3vw, 44px)",
                          border: `2px solid ${colors.oskar.green}`,
                        }}
                      >
                        <img
                          src={getAvatarUrl()}
                          alt={getUserFullName()}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={handleImageError}
                        />
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div
                      className="dropdown-menu dropdown-menu-end shadow border-0 show"
                      style={{
                        minWidth: "280px",
                        maxWidth: "350px",
                        marginTop: "0.5rem",
                      }}
                    >
                      <div className="p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle overflow-hidden me-3 flex-shrink-0 position-relative"
                            style={{
                              width: "48px",
                              height: "48px",
                              border: `2px solid ${colors.oskar.green}`,
                            }}
                          >
                            <img
                              src={getAvatarUrl()}
                              alt={getUserFullName()}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={handleImageError}
                            />
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <h6
                              className="fw-bold mb-0 text-truncate"
                              style={{ fontSize: "0.875rem" }}
                              title={getUserFullName()}
                            >
                              {getUserFullName()}
                            </h6>
                            {getEmailToDisplay() && (
                              <small
                                className="text-muted d-block text-truncate"
                                style={{ fontSize: "0.75rem" }}
                                title={getEmailToDisplay()}
                              >
                                {getEmailToDisplay()}
                              </small>
                            )}
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.6875rem" }}
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
                            fontSize: "0.875rem",
                            minHeight: "40px",
                          }}
                        >
                          <i
                            className="fa-solid fa-chart-line me-3 text-muted flex-shrink-0"
                            style={{ width: "18px" }}
                          ></i>
                          <span className="flex-grow-1">Dashboard</span>
                        </Link>

                        <Link
                          href={getUserProfileUrl()}
                          className="dropdown-item d-flex align-items-center py-2 px-3"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            fontSize: "0.875rem",
                            minHeight: "40px",
                          }}
                        >
                          <i
                            className="fa-solid fa-user me-3 text-muted flex-shrink-0"
                            style={{ width: "18px" }}
                          ></i>
                          <span className="flex-grow-1">Mon profil</span>
                        </Link>

                        {isVendeurOrUtilisateur() && (
                          <Link
                            href={getUserAnnoncesUrl()}
                            className="dropdown-item d-flex align-items-center py-2 px-3"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              fontSize: "0.875rem",
                              minHeight: "40px",
                            }}
                          >
                            <i
                              className="fa-solid fa-newspaper me-3 text-muted flex-shrink-0"
                              style={{ width: "18px" }}
                            ></i>
                            <span className="flex-grow-1">Mes annonces</span>
                          </Link>
                        )}

                        <Link
                          href={getUserMessagesUrl()}
                          className="dropdown-item d-flex align-items-center py-2 px-3"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            fontSize: "0.875rem",
                            minHeight: "40px",
                          }}
                        >
                          <i
                            className="fa-solid fa-envelope me-3 text-muted flex-shrink-0"
                            style={{ width: "18px" }}
                          ></i>
                          <span className="flex-grow-1">Messages</span>
                          {unreadMessagesCount > 0 && (
                            <span
                              className="badge bg-danger ms-auto flex-shrink-0"
                              style={{
                                fontSize: "0.625rem",
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
                            fontSize: "0.875rem",
                            minHeight: "40px",
                          }}
                        >
                          <i
                            className="fa-solid fa-right-from-bracket me-3 flex-shrink-0"
                            style={{ width: "18px" }}
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
                    fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                    color: colors.oskar.grey,
                    width: "clamp(36px, 3vw, 44px)",
                    height: "clamp(36px, 3vw, 44px)",
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

              <button
                className="btn d-flex align-items-center ms-3 ms-xl-4"
                style={{
                  backgroundColor:
                    hoveredButton === "publish"
                      ? colors.oskar.greenHover
                      : colors.oskar.green,
                  color: "white",
                  padding: "0.5rem 1.25rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  transition: "background-color 0.3s",
                  fontSize: "clamp(0.75rem, 1vw, 0.875rem)",
                  whiteSpace: "nowrap",
                  minHeight: "40px",
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

            {/* Actions Mobile/Tablette */}
            <div className="d-flex d-lg-none align-items-center">
              <Link href={isLoggedIn ? getUserMessagesUrl() : "#"}>
                <button
                  className="btn btn-link border-0 position-relative"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "1rem",
                    width: "36px",
                    height: "36px",
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
                        fontSize: "0.5rem",
                        minWidth: "14px",
                        height: "14px",
                        transform: "translate(-30%, -25%)",
                      }}
                    >
                      {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                    </span>
                  )}
                </button>
              </Link>

              <Link href="/liste-favoris">
                <button
                  className="btn btn-link border-0"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "1rem",
                    width: "36px",
                    height: "36px",
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

              <Link href="/contact">
                <button
                  className="btn btn-link border-0"
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "1rem",
                    width: "36px",
                    height: "36px",
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

              <button
                className="btn ms-1"
                style={{
                  backgroundColor: colors.oskar.green,
                  color: "white",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  border: "none",
                  minHeight: "36px",
                  whiteSpace: "nowrap",
                }}
                onClick={handlePublishClick}
                aria-label="Publier"
                type="button"
              >
                <i className="fa-solid fa-plus me-1"></i>
                <span>Publier</span>
              </button>
            </div>
          </div>

          {/* Barre de navigation mobile défilante */}
          {!loadingCategories && categories.length > 0 && (
            <div className="border-top d-lg-none">
              <div className="scrollable-nav py-2 px-1">
                <div
                  className="d-flex overflow-auto hide-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    gap: "0.5rem",
                  }}
                >
                  {navLinks.map((link, index) => (
                    <Link
                      key={`${link.name}-${index}-mobile`}
                      href={link.href}
                      className={`text-decoration-none px-3 py-1 ${isLinkActive(link) ? "fw-semibold" : ""}`}
                      style={{
                        color: isLinkActive(link)
                          ? colors.oskar.green
                          : colors.oskar.grey,
                        whiteSpace: "nowrap",
                        borderBottom: isLinkActive(link)
                          ? `2px solid ${colors.oskar.green}`
                          : "2px solid transparent",
                        fontSize: "0.875rem",
                        padding: "0.25rem 0.75rem",
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
      {mobileMenuOpen && (
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
              width: "85%",
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
                    width: "32px",
                    height: "32px",
                    backgroundColor: colors.oskar.green,
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{ fontSize: "0.875rem" }}
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
                    fontSize: "1.25rem",
                  }}
                ></i>
              </button>
            </div>

            <div className="p-2">
              {navLinks.map((link, index) => (
                <div key={`${link.name}-${index}-mobile-menu`}>
                  <Link
                    href={link.href}
                    className={`d-flex align-items-center justify-content-between py-3 px-3 text-decoration-none`}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: isLinkActive(link)
                        ? colors.oskar.green
                        : colors.oskar.grey,
                      borderLeft: isLinkActive(link)
                        ? `4px solid ${colors.oskar.green}`
                        : "4px solid transparent",
                      fontSize: "0.9375rem",
                      minHeight: "44px",
                    }}
                  >
                    <span className={isLinkActive(link) ? "fw-semibold" : ""}>
                      {link.name}
                    </span>
                    {link.hasChildren && (
                      <i
                        className="fa-solid fa-chevron-down text-muted"
                        style={{ fontSize: "0.75rem" }}
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
                            fontSize: "0.875rem",
                            minHeight: "40px",
                          }}
                        >
                          <i
                            className="fa-solid fa-angle-right me-2"
                            style={{ fontSize: "0.6875rem" }}
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
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Mon compte
                    </small>
                  </div>

                  <Link
                    href={getUserDashboard()}
                    className="d-flex align-items-center py-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.9375rem",
                      minHeight: "44px",
                    }}
                  >
                    <i
                      className="fa-solid fa-chart-line me-3"
                      style={{ width: "18px" }}
                    ></i>
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href={getUserProfileUrl()}
                    className="d-flex align-items-center py-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.9375rem",
                      minHeight: "44px",
                    }}
                  >
                    <i
                      className="fa-solid fa-user me-3"
                      style={{ width: "18px" }}
                    ></i>
                    <span>Mon profil</span>
                  </Link>

                  {isVendeurOrUtilisateur() && (
                    <Link
                      href={getUserAnnoncesUrl()}
                      className="d-flex align-items-center py-3 px-3 text-decoration-none"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        color: colors.oskar.grey,
                        fontSize: "0.9375rem",
                        minHeight: "44px",
                      }}
                    >
                      <i
                        className="fa-solid fa-newspaper me-3"
                        style={{ width: "18px" }}
                      ></i>
                      <span>Mes annonces</span>
                    </Link>
                  )}

                  <Link
                    href={getUserMessagesUrl()}
                    className="d-flex align-items-center py-3 px-3 text-decoration-none position-relative"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.9375rem",
                      minHeight: "44px",
                    }}
                  >
                    <i
                      className="fa-solid fa-envelope me-3"
                      style={{ width: "18px" }}
                    ></i>
                    <span>Messages</span>
                    {unreadMessagesCount > 0 && (
                      <span
                        className="position-absolute end-3 badge bg-danger"
                        style={{
                          fontSize: "0.625rem",
                          padding: "0.2rem 0.4rem",
                        }}
                      >
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>

                  <button
                    className="d-flex align-items-center py-3 px-3 w-100 text-start border-0 bg-transparent text-danger"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                    style={{
                      fontSize: "0.9375rem",
                      minHeight: "44px",
                    }}
                  >
                    <i
                      className="fa-solid fa-right-from-bracket me-3"
                      style={{ width: "18px" }}
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
                    padding: "0.75rem",
                    fontSize: "0.875rem",
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
          min-height: 40px;
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

        /* Ultra large screens (4K) */
        @media (min-width: 2560px) {
          .container-fluid {
            max-width: 2000px;
            margin: 0 auto;
          }
          
          .btn {
            font-size: 1rem !important;
          }
          
          .dropdown-menu {
            font-size: 1rem;
          }
        }

        /* Large desktop */
        @media (min-width: 1920px) and (max-width: 2559px) {
          .container-fluid {
            max-width: 1600px;
            margin: 0 auto;
          }
        }

        /* Standard desktop */
        @media (min-width: 1200px) and (max-width: 1919px) {
          .container-fluid {
            max-width: 1200px;
            margin: 0 auto;
          }
        }

        /* Small desktop */
        @media (min-width: 992px) and (max-width: 1199px) {
          .container-fluid {
            max-width: 960px;
            margin: 0 auto;
          }
          
          .nav-link {
            font-size: 0.875rem;
          }
        }

        /* Tablets */
        @media (min-width: 768px) and (max-width: 991px) {
          .container-fluid {
            max-width: 720px;
            margin: 0 auto;
          }
        }

        /* Mobile landscape */
        @media (min-width: 576px) and (max-width: 767px) {
          .container-fluid {
            max-width: 540px;
            margin: 0 auto;
          }
        }

        /* Mobile portrait */
        @media (max-width: 575px) {
          .container-fluid {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .btn,
          .dropdown-item,
          .nav-link {
            transition: none !important;
          }
        }

        /* Touch devices */
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
      `}</style>
    </>
  );
};

export default Header;