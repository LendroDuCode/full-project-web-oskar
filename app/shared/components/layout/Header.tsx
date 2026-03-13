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
// FONCTION POUR LE FALLBACK AVATAR - MODIFIÉE POUR AFFICHER LES DEUX INITIALES
// ============================================
const getDefaultAvatar = (prenom: string = "", nom: string = "", size: number = 40) => {
  // Récupérer la première lettre du prénom et la première lettre du nom
  const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : "";
  const lastInitial = nom ? nom.charAt(0).toUpperCase() : "";

  // Si les deux initiales sont disponibles, les combiner
  let initials = "U";
  if (firstInitial && lastInitial) {
    initials = `${firstInitial}${lastInitial}`;
  } else if (firstInitial) {
    initials = firstInitial;
  } else if (lastInitial) {
    initials = lastInitial;
  }

  return `https://ui-avatars.com/api/?name=${initials}&background=16a34a&color=fff&size=${size}&bold=true&length=2&font-size=0.5`;
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
  avatar?: string | null;
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
                  avatar: response.data?.avatar || user.avatar || null,
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
                  avatar: response.data?.avatar || user.avatar || null,
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
                  avatar: response.data?.avatar || user.avatar || null,
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
                  avatar: response.data?.avatar || user.avatar || null,
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

  // ✅ FONCTION POUR OBTENIR LE PRÉNOM ET LE NOM
  const getUserFirstAndLastName = useCallback(() => {
    const profile = user || userProfile;

    let prenom = "";
    let nom = "";

    if (profile) {
      // Essayer différentes sources pour le prénom
      prenom = profile.firstName || profile.prenoms || "";

      // Essayer différentes sources pour le nom
      nom = profile.lastName || profile.nom || "";

      // Si on a nom_complet mais pas de prénom/nom séparés, essayer de le découper
      if (!prenom && !nom && profile.nom_complet) {
        const nameParts = profile.nom_complet.split(' ');
        if (nameParts.length >= 2) {
          prenom = nameParts[0];
          nom = nameParts[nameParts.length - 1];
        } else {
          prenom = profile.nom_complet;
        }
      }
    }

    return { prenom, nom };
  }, [user, userProfile]);

  // ✅ FONCTION POUR VÉRIFIER SI L'AVATAR EST VALIDE
  const hasValidAvatar = useCallback((): boolean => {
    if (!userProfile?.avatar || avatarError) {
      return false;
    }

    // Vérifier si l'avatar n'est pas une chaîne vide ou null
    if (userProfile.avatar === "" || userProfile.avatar === null || userProfile.avatar === undefined) {
      return false;
    }

    return true;
  }, [userProfile, avatarError]);

  // ✅ FONCTION AVEC buildImageUrl CENTRALISÉ - CORRIGÉE POUR GÉRER undefined
  const getAvatarUrl = useCallback((): string => {
    const { prenom, nom } = getUserFirstAndLastName();

    if (!hasValidAvatar() || !userProfile?.avatar) {
      return getDefaultAvatar(prenom, nom, 40);
    }

    // S'assurer que userProfile.avatar est soit string, soit null
    const avatarValue = userProfile.avatar === undefined ? null : userProfile.avatar;
    const url = buildImageUrl(avatarValue);
    return (
      url ||
      getDefaultAvatar(prenom, nom, 40)
    );
  }, [userProfile, hasValidAvatar, getUserFirstAndLastName]);

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
      console.log("🔍 hasValidAvatar:", hasValidAvatar());
      console.log(
        "🔍 Avatar_key:",
        (user as any)?.avatar_key || (userProfile as any)?.avatar_key,
      );
    }
  }, [isLoggedIn, user, userProfile, getAvatarUrl, hasValidAvatar]);

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
    const { prenom, nom } = getUserFirstAndLastName();

    if (prenom && nom) {
      return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
    } else if (prenom) {
      return prenom.charAt(0).toUpperCase();
    } else if (nom) {
      return nom.charAt(0).toUpperCase();
    } else if (user?.email || userProfile?.email) {
      return (user?.email || userProfile?.email || "").charAt(0).toUpperCase();
    } else if (user?.nom_complet || userProfile?.nom_complet) {
      return (user?.nom_complet || userProfile?.nom_complet || "").charAt(0).toUpperCase();
    }
    return "U";
  }, [user, userProfile, getUserFirstAndLastName]);

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

  // ✅ FONCTION MIS À JOUR POUR LES ANNONCES - LES AGENTS ONT ACCÈS
  const getUserAnnoncesUrl = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    if (!userType) return "/";

    switch (userType) {
      case "vendeur":
        return "/dashboard-vendeur/annonces/liste-annonces";
      case "agent":
        return "/dashboard-agent/annonces";
      case "utilisateur":
        return "/dashboard-utilisateur/annonces/liste-annonces";
      case "admin":
        return "/dashboard-admin/annonces/liste-annonces";
      default:
        return "/";
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

  // ✅ FONCTION MIS À JOUR POUR DÉTERMINER QUI PEUT VOIR LES ANNONCES
  const canViewAnnonces = useCallback(() => {
    const userType = user?.type || userProfile?.type;
    return userType === "vendeur" || userType === "utilisateur" || userType === "agent" || userType === "admin";
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

  // GÉNÉRER LES LIENS DE NAVIGATION avec toutes les catégories en ordre inversé
  const generateNavLinks = (): NavLink[] => {
    const links: NavLink[] = [];

    if (!loadingCategories && categories.length > 0) {
      // Créer une copie inversée des catégories
      const reversedCategories = [...categories].reverse();
      
      // Afficher TOUTES les catégories en ordre inversé
      reversedCategories.forEach((category: Category) => {
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
            // Garder tous les enfants (également inversés si vous le souhaitez)
            mainLink.children = category.enfants.map((child: Category) => ({
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
            <div className="d-flex align-items-center flex-shrink-0">
              <button
                className="btn btn-link border-0 p-0 me-2 me-sm-3 d-lg-none mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                type="button"
                style={{
                  color: colors.oskar.grey,
                  fontSize: "1.2rem",
                  width: "40px",
                  height: "40px",
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
                className="d-flex align-items-center text-decoration-none flex-shrink-0"
                aria-label="Accueil OSKAR"
              >
                <div
                  className="rounded d-flex align-items-center justify-content-center"
                  style={{
                    width: "40px",
                    height: "40px",
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
                    style={{ fontSize: "1rem" }}
                  >
                    O
                  </span>
                </div>
                <span
                  className="fw-bold ms-2 d-none d-sm-inline"
                  style={{
                    color: colors.oskar.black,
                    fontSize: "1.5rem",
                    transition: "font-size 0.2s",
                  }}
                >
                  OSKAR
                </span>
              </Link>
            </div>

            {/* ===== MODIFICATION PRINCIPALE ===== */}
            {/* Navigation Desktop - Cachée sur mobile (≤ 991px) */}
            <div className="flex-grow-1 mx-3 mx-xl-4 position-relative d-none d-lg-block">
              <nav
                className="d-flex align-items-center justify-content-center"
                style={{
                  flexWrap: "nowrap",
                  gap: "0.35rem",
                }}
              >
                {loadingCategories ? (
                  <div className="d-flex align-items-center gap-2 flex-nowrap">
                    <div className="skeleton-loader" style={{ width: "50px", height: "18px", flexShrink: 0 }}></div>
                    <div className="skeleton-loader" style={{ width: "70px", height: "18px", flexShrink: 0 }}></div>
                    <div className="skeleton-loader" style={{ width: "45px", height: "18px", flexShrink: 0 }}></div>
                  </div>
                ) : (
                  navLinks.map((link, index) => (
                    <div
                      key={`${link.name}-${index}`}
                      className="position-relative flex-shrink-0"
                      ref={(el) => {
                        if (link.hasChildren && link.name) {
                          categoriesDropdownRef.current[link.name] = el;
                        }
                      }}
                    >
                      <Link
                        href={link.href}
                        className="text-decoration-none position-relative d-flex align-items-center nav-link"
                        style={{
                          transition: "color 0.3s",
                          color: getLinkColor(link),
                          fontWeight: isLinkActive(link) ? "600" : "400",
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap",
                          padding: "0.4rem 0",
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
                            style={{ fontSize: "0.55rem" }}
                          ></i>
                        )}
                        {isLinkActive(link) && !link.hasChildren && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-4px",
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
                              minWidth: "180px",
                              marginTop: "0",
                              top: "100%",
                              left: "0",
                              zIndex: 1001,
                              borderRadius: "6px",
                              padding: "0.4rem 0",
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
                                  fontSize: "0.8rem",
                                  color: colors.oskar.grey,
                                  transition: "all 0.2s",
                                  minHeight: "36px",
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

            {/* Actions Desktop - Cachées sur mobile (≤ 991px) */}
            <div className="d-none d-lg-flex align-items-center flex-shrink-0 action-buttons">
              <Link href={isLoggedIn ? getUserMessagesUrl() : "#"}>
                <button
                  className="btn btn-link border-0 position-relative me-2 me-xl-3 action-button"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1rem",
                    color:
                      pathname.includes("/messages") ||
                      pathname.includes("/messagerie")
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "36px",
                    height: "36px",
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
                </button>
              </Link>

              <Link href="/contact">
                <button
                  className="btn btn-link border-0 me-2 me-xl-3 action-button"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1rem",
                    color:
                      pathname === "/contact"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "36px",
                    height: "36px",
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
                  className="btn btn-link border-0 me-3 me-xl-4 action-button"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1rem",
                    color:
                      pathname === "/liste-favoris"
                        ? colors.oskar.green
                        : colors.oskar.grey,
                    width: "36px",
                    height: "36px",
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

              {/* Compte utilisateur Desktop */}
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
                          width: "36px",
                          height: "36px",
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
                        className="rounded-circle overflow-hidden position-relative d-flex align-items-center justify-content-center"
                        style={{
                          width: "36px",
                          height: "36px",
                          border: `2px solid ${colors.oskar.green}`,
                          backgroundColor: hasValidAvatar() ? 'transparent' : colors.oskar.green,
                        }}
                      >
                        {hasValidAvatar() ? (
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
                        ) : (
                          <span className="text-white fw-bold" style={{ fontSize: '14px' }}>
                            {getUserInitials()}
                          </span>
                        )}
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div
                      className="dropdown-menu dropdown-menu-end shadow border-0 show"
                      style={{
                        minWidth: "clamp(220px, 18vw, 260px)",
                        maxWidth: "320px",
                        marginTop: "0.4rem",
                      }}
                    >
                      <div className="p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle overflow-hidden me-3 flex-shrink-0 position-relative d-flex align-items-center justify-content-center"
                            style={{
                              width: "40px",
                              height: "40px",
                              border: `2px solid ${colors.oskar.green}`,
                              backgroundColor: hasValidAvatar() ? 'transparent' : colors.oskar.green,
                            }}
                          >
                            {hasValidAvatar() ? (
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
                            ) : (
                              <span className="text-white fw-bold" style={{ fontSize: '1rem' }}>
                                {getUserInitials()}
                              </span>
                            )}
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <h6
                              className="fw-bold mb-0 text-truncate"
                              style={{ fontSize: "0.8rem" }}
                              title={getUserFullName()}
                            >
                              {getUserFullName()}
                            </h6>
                            {getEmailToDisplay() && (
                              <small
                                className="text-muted d-block text-truncate"
                                style={{ fontSize: "0.7rem" }}
                                title={getEmailToDisplay()}
                              >
                                {getEmailToDisplay()}
                              </small>
                            )}
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.6rem" }}
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
                            fontSize: "0.8rem",
                            minHeight: "36px",
                          }}
                        >
                          <i
                            className="fa-solid fa-chart-line me-3 text-muted flex-shrink-0"
                            style={{ width: "16px", fontSize: "0.9rem" }}
                          ></i>
                          <span className="flex-grow-1">Dashboard</span>
                        </Link>

                        <Link
                          href={getUserProfileUrl()}
                          className="dropdown-item d-flex align-items-center py-2 px-3"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            fontSize: "0.8rem",
                            minHeight: "36px",
                          }}
                        >
                          <i
                            className="fa-solid fa-user me-3 text-muted flex-shrink-0"
                            style={{ width: "16px", fontSize: "0.9rem" }}
                          ></i>
                          <span className="flex-grow-1">Mon profil</span>
                        </Link>

                        {/* ✅ LIEN VERS LES ANNONCES POUR TOUS LES TYPES D'UTILISATEURS */}
                        {canViewAnnonces() && (
                          <Link
                            href={getUserAnnoncesUrl()}
                            className="dropdown-item d-flex align-items-center py-2 px-3"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              fontSize: "0.8rem",
                              minHeight: "36px",
                            }}
                          >
                            <i
                              className="fa-solid fa-newspaper me-3 text-muted flex-shrink-0"
                              style={{ width: "16px", fontSize: "0.9rem" }}
                            ></i>
                            <span className="flex-grow-1">Les annonces</span>
                          </Link>
                        )}

                        <Link
                          href={getUserMessagesUrl()}
                          className="dropdown-item d-flex align-items-center py-2 px-3"
                          onClick={() => setDropdownOpen(false)}
                          style={{
                            fontSize: "0.8rem",
                            minHeight: "36px",
                          }}
                        >
                          <i
                            className="fa-solid fa-envelope me-3 text-muted flex-shrink-0"
                            style={{ width: "16px", fontSize: "0.9rem" }}
                          ></i>
                          <span className="flex-grow-1">Messages</span>
                        </Link>

                        <div className="dropdown-divider my-2"></div>
                        <button
                          className="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                          onClick={handleLogout}
                          type="button"
                          style={{
                            fontSize: "0.8rem",
                            minHeight: "36px",
                          }}
                        >
                          <i
                            className="fa-solid fa-right-from-bracket me-3 flex-shrink-0"
                            style={{ width: "16px", fontSize: "0.9rem" }}
                          ></i>
                          <span className="flex-grow-1">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-link border-0 action-button"
                  style={{
                    transition: "color 0.3s",
                    fontSize: "1rem",
                    color: colors.oskar.grey,
                    width: "36px",
                    height: "36px",
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
                className="btn d-flex align-items-center ms-3 ms-xl-4 publish-button"
                style={{
                  backgroundColor:
                    hoveredButton === "publish"
                      ? colors.oskar.greenHover
                      : colors.oskar.green,
                  color: "white",
                  padding: "0.4rem 1rem",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  transition: "background-color 0.3s",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                  minHeight: "34px",
                }}
                onMouseEnter={() => setHoveredButton("publish")}
                onMouseLeave={() => setHoveredButton(null)}
                aria-label="Publier une annonce"
                onClick={handlePublishClick}
                type="button"
              >
                <i className="fa-solid fa-plus me-2" style={{ fontSize: "0.7rem" }}></i>
                <span>Publier</span>
              </button>
            </div>

            {/* ===== ÉLÉMENTS MOBILES ===== */}
            {/* Icône de connexion/utilisateur sur mobile - visible uniquement sur mobile */}
            <div className="d-lg-none d-flex align-items-center">
              {isLoggedIn ? (
                <button
                  className="btn btn-link border-0 p-0 me-2"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{
                    color: colors.oskar.grey,
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    className="rounded-circle overflow-hidden"
                    style={{
                      width: "32px",
                      height: "32px",
                      border: `2px solid ${colors.oskar.green}`,
                      backgroundColor: hasValidAvatar() ? 'transparent' : colors.oskar.green,
                    }}
                  >
                    {hasValidAvatar() ? (
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
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        <span className="text-white fw-bold" style={{ fontSize: '12px' }}>
                          {getUserInitials()}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ) : (
                <button
                  className="btn btn-link border-0 p-0 me-2"
                  onClick={handleLoginClick}
                  style={{
                    color: colors.oskar.grey,
                    fontSize: "1.2rem",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fa-solid fa-user"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile Plein Écran - CONTIENT TOUS LES ÉLÉMENTS */}
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
              maxWidth: "300px",
              zIndex: 1000,
              overflowY: "auto",
            }}
          >
            <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div className="d-flex align-items-center">
                <div
                  className="rounded d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: colors.oskar.green,
                  }}
                >
                  <span
                    className="text-white fw-bold"
                    style={{ fontSize: "0.75rem" }}
                  >
                    O
                  </span>
                </div>
                <span
                  className="fw-bold"
                  style={{
                    color: colors.oskar.black,
                    fontSize: "0.9rem",
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
                    fontSize: "1rem",
                  }}
                ></i>
              </button>
            </div>

            <div className="p-2">
              {/* LIENS DE NAVIGATION DANS LE MENU MOBILE */}
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
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <span className={isLinkActive(link) ? "fw-semibold" : ""}>
                      {link.name}
                    </span>
                    {link.hasChildren && (
                      <i
                        className="fa-solid fa-chevron-down text-muted"
                        style={{ fontSize: "0.65rem" }}
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
                            fontSize: "0.8rem",
                            minHeight: "36px",
                          }}
                        >
                          <i
                            className="fa-solid fa-angle-right me-2"
                            style={{ fontSize: "0.6rem" }}
                          ></i>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* SECTION COMPTE UTILISATEUR DANS LE MENU MOBILE */}
              {isLoggedIn && (
                <div className="mt-4 border-top pt-3">
                  <div className="px-3 mb-2">
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                      Mon compte
                    </small>
                  </div>

                  <Link
                    href={getUserDashboard()}
                    className="d-flex align-items-center py-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <i
                      className="fa-solid fa-chart-line me-3"
                      style={{ width: "16px", fontSize: "0.9rem" }}
                    ></i>
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href={getUserProfileUrl()}
                    className="d-flex align-items-center py-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <i
                      className="fa-solid fa-user me-3"
                      style={{ width: "16px", fontSize: "0.9rem" }}
                    ></i>
                    <span>Mon profil</span>
                  </Link>

                  {/* ✅ LIEN VERS LES ANNONCES DANS LE MENU MOBILE */}
                  {canViewAnnonces() && (
                    <Link
                      href={getUserAnnoncesUrl()}
                      className="d-flex align-items-center py-3 px-3 text-decoration-none"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        color: colors.oskar.grey,
                        fontSize: "0.85rem",
                        minHeight: "40px",
                      }}
                    >
                      <i
                        className="fa-solid fa-newspaper me-3"
                        style={{ width: "16px", fontSize: "0.9rem" }}
                      ></i>
                      <span>Les annonces</span>
                    </Link>
                  )}

                  <Link
                    href={getUserMessagesUrl()}
                    className="d-flex align-items-center py-3 px-3 text-decoration-none position-relative"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <i
                      className="fa-solid fa-envelope me-3"
                      style={{ width: "16px", fontSize: "0.9rem" }}
                    ></i>
                    <span>Messages</span>
                  </Link>

                  <Link
                    href="/contact"
                    className="d-flex align-items-center py-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <i
                      className="fa-solid fa-phone me-3"
                      style={{ width: "16px", fontSize: "0.9rem" }}
                    ></i>
                    <span>Contact</span>
                  </Link>

                  <Link
                    href="/liste-favoris"
                    className="d-flex align-items-center py-3 px-3 text-decoration-none"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: colors.oskar.grey,
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <i
                      className="fa-solid fa-heart me-3"
                      style={{ width: "16px", fontSize: "0.9rem" }}
                    ></i>
                    <span>Favoris</span>
                  </Link>

                  <button
                    className="d-flex align-items-center py-3 px-3 w-100 text-start border-0 bg-transparent text-danger"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                    style={{
                      fontSize: "0.85rem",
                      minHeight: "40px",
                    }}
                  >
                    <i
                      className="fa-solid fa-right-from-bracket me-3"
                      style={{ width: "16px", fontSize: "0.9rem" }}
                    ></i>
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

              {/* BOUTON PUBLIER DANS LE MENU MOBILE */}
              <div className="p-3 mt-3">
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: colors.oskar.green,
                    color: "white",
                    borderRadius: "6px",
                    border: "none",
                    fontWeight: 600,
                    padding: "0.6rem",
                    fontSize: "0.8rem",
                  }}
                  onClick={() => {
                    handlePublishClick();
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                >
                  <i className="fa-solid fa-plus me-2" style={{ fontSize: "0.7rem" }}></i>
                  Publier une annonce
                </button>
              </div>

              {/* LIENS DE CONNEXION/INSCRIPTION SI NON CONNECTÉ */}
              {!isLoggedIn && (
                <div className="p-3">
                  <button
                    className="btn w-100 mb-2"
                    style={{
                      backgroundColor: colors.oskar.green,
                      color: "white",
                      borderRadius: "6px",
                      border: "none",
                      fontWeight: 600,
                      padding: "0.6rem",
                      fontSize: "0.8rem",
                    }}
                    onClick={() => {
                      handleLoginClick();
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    <i className="fa-solid fa-right-to-bracket me-2"></i>
                    Se connecter
                  </button>
                  <button
                    className="btn w-100"
                    style={{
                      backgroundColor: "transparent",
                      color: colors.oskar.green,
                      borderRadius: "6px",
                      border: `1px solid ${colors.oskar.green}`,
                      fontWeight: 600,
                      padding: "0.6rem",
                      fontSize: "0.8rem",
                    }}
                    onClick={() => {
                      // Ouvrir modal d'inscription
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    <i className="fa-solid fa-user-plus me-2"></i>
                    S'inscrire
                  </button>
                </div>
              )}
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
          min-height: 36px;
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

        /* Touch devices */
        @media (max-width: 991px) {
          .btn,
          .dropdown-item,
          .nav-link {
            min-height: 40px;
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