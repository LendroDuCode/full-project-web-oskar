"use client";

import { useState, ChangeEvent, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faHandHoldingHeart,
  faArrowsRotate,
  faTag as faSaleTag,
  faCheckCircle,
  faArrowRight,
  faArrowLeft,
  faInfoCircle,
  faExclamationCircle,
  faTimes,
  faRobot,
  faShield,
  faGavel,
  faBan,
  faThumbsUp,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import colors from "../../shared/constants/colors";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import {
  AdTypeOption,
  Category,
  DonData,
  EchangeData,
  PublishAdModalProps,
  VenteData,
  Boutique,
  SaleMode,
  ConditionOption,
  Suggestion,
} from "./components/constantes/types";
import DonForm from "./components/DonForm";
import EchangeForm from "./components/ExchangeForm";
import VenteForm from "./components/SaleForm";
import CreateBoutiqueModal from "@/app/(back-office)/dashboard-vendeur/boutique/apercu/components/modals/CreateBoutiqueModal";
import VendeurRegisterModal from "@/app/(front-office)/auth/register/VendeurRegisterModal";
import AISuggestionsModal from "./components/AISuggestionsModal";

const PublishAdModal: React.FC<PublishAdModalProps> = ({
  visible,
  onHide,
  isLoggedIn: isLoggedInProp,
  onLoginRequired,
  user: userProp,
}) => {
  // ============================================
  // 1. TOUS LES useState en premier
  // ============================================
  const [adType, setAdType] = useState<"don" | "exchange" | "sale" | null>(null);
  const [saleMode, setSaleMode] = useState<SaleMode>("particulier");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // États pour l'IA
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>([]);
  const [pendingDonData, setPendingDonData] = useState<any>(null);
  const [aiModerationEnabled, setAiModerationEnabled] = useState(true);
  const [currentDonUuid, setCurrentDonUuid] = useState<string | null>(null);
  
  // ✅ État pour sauvegarder l'image séparément (pour les suggestions)
  const [savedImageFile, setSavedImageFile] = useState<File | null>(null);
  
  // État pour l'utilisateur récupéré depuis localStorage
  const [localUser, setLocalUser] = useState<any>(null);

  // État pour les catégories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // États pour la création de boutique
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [loadingBoutique, setLoadingBoutique] = useState(false);
  const [boutiqueCreationSuccess, setBoutiqueCreationSuccess] = useState(false);
  const [pendingVenteData, setPendingVenteData] = useState<VenteData | null>(null);
  const [createdBoutiqueUuid, setCreatedBoutiqueUuid] = useState<string | null>(null);
  const [createdBoutiqueNom, setCreatedBoutiqueNom] = useState<string | null>(null);

  // État pour le modal d'inscription vendeur
  const [showVendeurRegisterModal, setShowVendeurRegisterModal] = useState(false);

  // Référence pour suivre si la boutique a été présélectionnée
  const boutiquePreselectedRef = useRef(false);
  
  // États pour vérifier si le vendeur a une boutique
  const [loadingBoutiques, setLoadingBoutiques] = useState(false);
  const [hasActiveBoutique, setHasActiveBoutique] = useState<boolean>(false);
  const [verificationBoutiqueDone, setVerificationBoutiqueDone] = useState<boolean>(false);
  const [boutiqueInfo, setBoutiqueInfo] = useState<{ uuid: string; nom: string } | null>(null);

  // Données de formulaire
  const [donData, setDonData] = useState<DonData>({
    description: "",
    type_don: "",
    localisation: "",
    lieu_retrait: "",
    image: null,
    categorie_uuid: "",
    sous_categorie_uuid: "",
    numero: "",
    quantite: "1",
    nom_donataire: "",
    titre: "",
    condition: "bon",
    disponibilite: "immediate",
  });

  const [echangeData, setEchangeData] = useState<EchangeData>({
    nomElementEchange: "",
    numero: "",
    nom_initiateur: "vendeur",
    typeEchange: "produit",
    sous_categorie_uuid: "",
    objetPropose: "",
    objetDemande: "",
    message: "",
    prix: "",
    categorie_uuid: "",
    image: null,
    quantite: "1",
    type_destinataire: "autre",
  });

  const [venteData, setVenteData] = useState<VenteData>({
    boutiqueUuid: "",
    sous_categorie_uuid: "",
    boutiqueNom: "",
    libelle: "",
    type: "",
    disponible: true,
    categorie_uuid: "",
    statut: "publie",
    etoile: "5",
    image: null,
    prix: "",
    quantite: "1",
    description: "",
    lieu: "",
    condition: "neuf",
    garantie: "non",
    saleMode: "particulier",
  });

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(null);

  // ============================================
  // 2. LES DONNÉES DÉRIVÉES
  // ============================================
  const user = localUser;
  const isLoggedIn = isLoggedInProp || !!user;
  const isVendeur = user?.type?.toLowerCase() === "vendeur";

  // ============================================
  // 3. LES CONSTANTES
  // ============================================
  const colorsByType = {
    don: {
      primary: "#8b5cf6",
      light: "#ede9fe",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      iconBg: "#f5f3ff",
      border: "#8b5cf6",
      text: "text-violet-600",
      bg: "bg-violet-50",
    },
    exchange: {
      primary: "#007aff",
      light: "#e6f2ff",
      gradient: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
      iconBg: "#e6f2ff",
      border: "#007aff",
      text: "text-blue-600",
      bg: "bg-blue-50",
    },
    sale: {
      primary: "#34c759",
      light: "#e6f7ec",
      gradient: "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
      iconBg: "#e6f7ec",
      border: "#34c759",
      text: "text-green-600",
      bg: "bg-green-50",
    },
  };

  const adTypeOptions: AdTypeOption[] = [
    {
      id: "don",
      title: "Faire un Don",
      description: "Offrez gratuitement à votre communauté",
      icon: faHandHoldingHeart,
      color: "violet",
      gradient: colorsByType.don.gradient,
      iconBg: colorsByType.don.iconBg,
    },
    {
      id: "exchange",
      title: "Proposer un Échange",
      description: "Trouvez ce dont vous avez besoin",
      icon: faArrowsRotate,
      color: "primary",
      gradient: colorsByType.exchange.gradient,
      iconBg: colorsByType.exchange.iconBg,
    },
    {
      id: "sale",
      title: "Vendre un Produit",
      description: "Gagnez de l'argent localement",
      icon: faSaleTag,
      color: "success",
      gradient: colorsByType.sale.gradient,
      iconBg: colorsByType.sale.iconBg,
    },
  ];

  // Conditions pour les produits
  const conditions: ConditionOption[] = [
    { value: "neuf", label: "Neuf (jamais utilisé)" },
    { value: "tresbon", label: "Très bon état" },
    { value: "bon", label: "Bon état" },
    { value: "moyen", label: "État moyen" },
    { value: "areparer", label: "À réparer" },
  ];

  // ============================================
  // 4. LES useEffect
  // ============================================
  
  // Récupérer l'utilisateur depuis localStorage
  useEffect(() => {
    if (userProp) {
      console.log("📦 Utilisateur reçu via props:", userProp);
      setLocalUser(userProp);
    } else {
      try {
        const userStr = localStorage.getItem("oskar_user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          console.log("📦 Utilisateur récupéré depuis localStorage:", userData);
          setLocalUser(userData);
        } else {
          console.log("⚠️ Aucun utilisateur trouvé dans localStorage");
        }
      } catch (error) {
        console.error("❌ Erreur récupération utilisateur:", error);
      }
    }
  }, [userProp]);

  // Vérifier le statut de l'IA au chargement
  useEffect(() => {
    const checkAIStatus = async () => {
      console.log("🔍 Vérification du statut IA pour l'utilisateur:", user?.type);
      console.log("🔍 isVendeur:", isVendeur);
      console.log("🔍 isLoggedIn:", isLoggedIn);
      
      if (!isLoggedIn) {
        console.log("⚠️ Utilisateur non connecté, IA désactivée");
        setAiModerationEnabled(false);
        return;
      }
      
      try {
        const response = await api.get(API_ENDPOINTS.IA_MODERATION.STATUT);
        console.log("✅ Statut IA récupéré depuis l'API:", response);
        
        const isEnabled = response.isModerationEnabled === true;
        
        setAiModerationEnabled(isEnabled);
        console.log(`🔧 IA modération ${isEnabled ? 'ACTIVÉE' : 'DÉSACTIVÉE (modération manuelle active)'} pour ${user?.type || 'utilisateur'}`);
        
      } catch (error) {
        console.error("❌ Erreur vérification statut IA:", error);
        setAiModerationEnabled(true);
        console.log("⚠️ IA activée par défaut (après erreur API)");
      }
    };
    
    if (visible) {
      checkAIStatus();
    }
  }, [visible, isLoggedIn, user]);

  // Charger les catégories quand le modal s'ouvre
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError(null);
        console.log("🟡 PublishAdModal - Fetching categories from API...");

        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        console.log("🟢 PublishAdModal - Categories API raw response:", response);

        if (Array.isArray(response)) {
          const activeCategories = response.filter(
            (cat: Category) => !cat.is_deleted && cat.deleted_at === null
          );

          const mainCategories = activeCategories.filter(
            (cat: Category) => !cat.path || cat.path === null || cat.path === ""
          );

          const uniqueCategoriesMap = new Map<string, Category>();

          mainCategories.forEach((category: Category) => {
            const existing = uniqueCategoriesMap.get(category.libelle);

            if (!existing) {
              uniqueCategoriesMap.set(category.libelle, category);
            } else {
              const existingId = existing.id || 0;
              const currentId = category.id || 0;
              if (currentId > existingId) {
                uniqueCategoriesMap.set(category.libelle, category);
              }
            }
          });

          const uniqueMainCategories = Array.from(uniqueCategoriesMap.values());

          const processedCategories: Category[] = uniqueMainCategories.map((category: Category) => {
            const enfants = category.enfants || [];
            const activeEnfants = enfants.filter(
              (enfant: Category) => !enfant.is_deleted && enfant.deleted_at === null
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
              ...category,
              enfants: uniqueChildren
            };
          });

          const sortedCategories = processedCategories.sort(
            (a: Category, b: Category) => a.libelle.localeCompare(b.libelle)
          );

          setCategories(sortedCategories);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (error: any) {
        console.error("🔴 PublishAdModal - Error loading categories:", error);
        setCategoriesError("Impossible de charger les catégories");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  // ✅ Vérifier si le vendeur a déjà une boutique (via API dédiée)
  useEffect(() => {
    const checkExistingBoutique = async () => {
      if (!isLoggedIn || !isVendeur || adType !== "sale") {
        setVerificationBoutiqueDone(true);
        setHasActiveBoutique(false);
        setBoutiqueInfo(null);
        setBoutiques([]);
        return;
      }

      try {
        setLoadingBoutiques(true);
        console.log("🔍 Vérification des boutiques existantes via API dédiée...");
        
        const result = await api.get(API_ENDPOINTS.BOUTIQUES.VERIFIER);
        console.log("📊 Résultat vérification boutique:", result);
        
        if (result.hasBoutique) {
          console.log("✅ Vendeur avec boutique existante:", result.boutiqueNom);
          setHasActiveBoutique(true);
          setBoutiqueInfo({
            uuid: result.boutiqueUuid,
            nom: result.boutiqueNom,
          });
          
          setBoutiques([{
            uuid: result.boutiqueUuid!,
            nom: result.boutiqueNom!,
            statut: "actif",
            est_bloque: false,
            est_ferme: false,
            logo: null,
            banniere: null,
            description: null,
          } as Boutique]);
          
          if (!venteData.boutiqueUuid) {
            console.log(`🏪 Sélection automatique de la boutique: ${result.boutiqueNom}`);
            setVenteData(prev => ({
              ...prev,
              boutiqueUuid: result.boutiqueUuid!,
              boutiqueNom: result.boutiqueNom!,
            }));
          }
        } else {
          console.log("❌ Aucune boutique trouvée");
          setHasActiveBoutique(false);
          setBoutiqueInfo(null);
          setBoutiques([]);
        }
      } catch (error) {
        console.error("❌ Erreur vérification boutique:", error);
        setHasActiveBoutique(false);
        setBoutiqueInfo(null);
        setBoutiques([]);
      } finally {
        setLoadingBoutiques(false);
        setVerificationBoutiqueDone(true);
      }
    };

    if (visible && isLoggedIn && isVendeur && adType === "sale") {
      checkExistingBoutique();
    } else {
      setVerificationBoutiqueDone(true);
      setLoadingBoutiques(false);
    }
  }, [visible, isLoggedIn, isVendeur, adType]);

  // Mettre à jour selectedBoutique quand boutiqueUuid change
  useEffect(() => {
    if (venteData.boutiqueUuid && boutiques.length > 0) {
      const boutique = boutiques.find((b) => b.uuid === venteData.boutiqueUuid);
      setSelectedBoutique(boutique || null);
    } else {
      setSelectedBoutique(null);
    }
  }, [venteData.boutiqueUuid, boutiques]);

  // Réinitialiser la référence quand le type d'annonce change
  useEffect(() => {
    if (adType !== "sale") {
      setShowBoutiqueModal(false);
      setPendingVenteData(null);
      boutiquePreselectedRef.current = false;
    }
  }, [adType]);

  // ============================================
  // 5. LES FONCTIONS DE GESTION D'IMAGE
  // ============================================
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError("L'image ne doit pas dépasser 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setSubmitError("Veuillez sélectionner une image valide");
        return;
      }

      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      switch (adType) {
        case "don":
          setDonData({ ...donData, image: file });
          setSavedImageFile(file);
          break;
        case "exchange":
          setEchangeData({ ...echangeData, image: file });
          setSavedImageFile(file);
          break;
        case "sale":
          setVenteData({ ...venteData, image: file });
          setSavedImageFile(file);
          break;
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSavedImageFile(null);
    switch (adType) {
      case "don":
        setDonData({ ...donData, image: null });
        break;
      case "exchange":
        setEchangeData({ ...echangeData, image: null });
        break;
      case "sale":
        setVenteData({ ...venteData, image: null });
        break;
    }
  };

  // ============================================
  // 6. LES FONCTIONS DE NOTIFICATION ET BOUTIQUE
  // ============================================
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success', shouldReload: boolean = true) => {
    const cleanMessage = message.replace(/\s*\(sans analyse d'image\)\s*/g, '');
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setPendingMessage(cleanMessage);
    
    let duration = 3000;
    if (type === 'error') duration = 5000;
    if (type === 'info') duration = 4000;
    
    notificationTimeoutRef.current = setTimeout(() => {
      setPendingMessage(null);
      notificationTimeoutRef.current = null;
      
      if (shouldReload) {
        console.log("🔄 Rechargement de la page après publication...");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }, duration);
  };

  const handleOpenCreateBoutique = () => {
    setPendingVenteData({ ...venteData });
    setShowBoutiqueModal(true);
  };

  const handleOpenVendeurRegister = () => {
    setShowVendeurRegisterModal(true);
  };

  const handleCloseVendeurRegister = () => {
    setShowVendeurRegisterModal(false);
  };

  const handleVendeurRegistered = (vendeurData: any) => {
    console.log("✅ Vendeur inscrit:", vendeurData);
    setShowVendeurRegisterModal(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // ============================================
  // 7. LES FONCTIONS DE LOGIQUE MÉTIER
  // ============================================
  const checkBoutiqueBeforeProceed = () => {
    if (adType === "sale" && isVendeur) {
      if (!verificationBoutiqueDone) {
        console.log("⏳ Vérification des boutiques en cours...");
        setSubmitError("Vérification des boutiques en cours, veuillez patienter...");
        return true;
      }
      
      if (hasActiveBoutique) {
        console.log("✅ Vendeur avec boutique existante, pas de modal");
        if (!venteData.boutiqueUuid) {
          console.log("⚠️ Vendeur avec boutique mais aucune sélectionnée");
          setSubmitError("Veuillez sélectionner une boutique pour vendre ce produit");
          return true;
        }
        return false;
      }
      
      console.log("🏪 Vendeur sans boutique, ouverture du modal");
      setPendingVenteData({ ...venteData });
      setShowBoutiqueModal(true);
      return true;
    }
    return false;
  };

  const nextStep = () => {
    if (adType === "sale" && isVendeur && loadingBoutiques) {
      setSubmitError("Chargement des boutiques en cours, veuillez patienter...");
      return;
    }
    
    if (adType === "sale" && isVendeur && !verificationBoutiqueDone) {
      setSubmitError("Vérification des boutiques en cours, veuillez patienter...");
      return;
    }
    
    if (step === 2 && adType === "sale" && isVendeur) {
      if (!hasActiveBoutique && verificationBoutiqueDone && !loadingBoutiques) {
        console.log("🏪 Vendeur sans boutique, ouverture du modal");
        setPendingVenteData({ ...venteData });
        setShowBoutiqueModal(true);
        return;
      }
      
      if (hasActiveBoutique && !venteData.boutiqueUuid) {
        setSubmitError("Veuillez sélectionner une boutique pour vendre ce produit");
        return;
      }
    }
    
    setStep(step + 1);
  };

  const prevStep = () => step > 1 && setStep(step - 1);

  const selectAdType = (type: "don" | "exchange" | "sale") => {
    setAdType(type);
    setStep(2);
    setSubmitError(null);
    setShowBoutiqueModal(false);
    setPendingVenteData(null);
    boutiquePreselectedRef.current = false;
  };

  const handleBoutiqueChange = (
    boutiqueUuid: string,
    boutiqueNom: string = "",
  ) => {
    console.log(`🔄 Changement de boutique: ${boutiqueUuid} - ${boutiqueNom}`);
    setVenteData({
      ...venteData,
      boutiqueUuid,
      boutiqueNom,
    });
  };

  const handleCreateBoutique = async (formData: FormData) => {
    setLoadingBoutique(true);
    setSubmitError(null);

    try {
      console.log("🏪 Création de boutique avec données:");

      const response = await api.post(API_ENDPOINTS.BOUTIQUES.CREATE, formData, {
        isFormData: true
      });

      console.log("✅ Boutique créée avec succès:", response);

      const newBoutiqueUuid = response?.boutique?.uuid || response?.uuid || response?.data?.uuid;
      const newBoutiqueNom = response?.boutique?.nom || response?.nom || formData.get("nom") as string;

      if (!newBoutiqueUuid) {
        console.error("❌ Impossible de récupérer l'UUID de la boutique créée:", response);
        throw new Error("Erreur lors de la création de la boutique : UUID non reçu");
      }

      console.log("✅ Nouvelle boutique créée:", { uuid: newBoutiqueUuid, nom: newBoutiqueNom });

      setCreatedBoutiqueUuid(newBoutiqueUuid);
      setCreatedBoutiqueNom(newBoutiqueNom);
      
      setHasActiveBoutique(true);
      setVerificationBoutiqueDone(true);
      setBoutiqueInfo({ uuid: newBoutiqueUuid, nom: newBoutiqueNom });
      
      setBoutiques([{
        uuid: newBoutiqueUuid,
        nom: newBoutiqueNom,
        statut: "actif",
        est_bloque: false,
        est_ferme: false,
        logo: null,
        banniere: null,
        description: null,
      } as Boutique]);

      setShowBoutiqueModal(false);
      setBoutiqueCreationSuccess(true);

      if (pendingVenteData) {
        console.log("🔄 Mise à jour des données de vente avec la nouvelle boutique:", {
          uuid: newBoutiqueUuid,
          nom: newBoutiqueNom
        });
        setVenteData({
          ...pendingVenteData,
          boutiqueUuid: newBoutiqueUuid,
          boutiqueNom: newBoutiqueNom,
        });
        setPendingVenteData(null);
      }

      setTimeout(() => setBoutiqueCreationSuccess(false), 3000);
    } catch (error: any) {
      console.error("❌ Erreur création boutique:", error);

      let errorMessage = "Erreur lors de la création de la boutique";

      if (error.response?.status === 401) {
        errorMessage = "Votre session a expiré. Veuillez vous reconnecter.";
        onLoginRequired();
      } else if (error.response?.status === 403) {
        errorMessage = "Vous n'avez pas l'autorisation de créer une boutique.";
      } else if (error.response?.status === 400) {
        const data = error.response?.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (data?.errors) {
          if (typeof data.errors === 'object') {
            errorMessage = Object.values(data.errors).flat().join(", ");
          } else {
            errorMessage = data.errors;
          }
        } else if (data?.error) {
          errorMessage = data.error;
        } else {
          errorMessage = "Données invalides. Vérifiez les informations fournies.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setLoadingBoutique(false);
    }
  };

  // ============================================
  // 8. LES FONCTIONS DE PUBLICATION AVEC IA
  // ============================================
  const publishDonWithAI = async (formData: FormData, suggestionsAcceptees?: { suggestionId: string; champ: string; texteModifie?: string } | { suggestionId: string; champ: string; texteModifie?: string }[]) => {
    try {
      setLoading(true);
      setSubmitError(null);
      
      console.log("🚀 [IA] Début publication du don avec IA...");
      console.log("📝 [IA] suggestionsAcceptees:", suggestionsAcceptees);
      
      // ✅ ÉTAPE 1: Créer le don UNIQUEMENT s'il n'existe pas encore
      let donUuid = currentDonUuid;
      
      if (!donUuid) {
        const createResponse = await api.post(API_ENDPOINTS.DONS.CREATE, formData, {
          isFormData: true,
        });
        
        donUuid = createResponse.data?.uuid || createResponse.uuid;
        
        if (!donUuid) {
          throw new Error("Impossible de récupérer l'UUID du don");
        }
        
        console.log("✅ [IA] Don créé avec UUID:", donUuid);
        setCurrentDonUuid(donUuid);
      } else {
        // ✅ Si on a déjà un UUID, on met à jour le don existant
        console.log("🔄 [IA] Mise à jour du don existant avec UUID:", donUuid);
        
        // Récupérer les données du formulaire sous forme d'objet
        const formDataObj: any = {};
        for (const [key, value] of formData.entries()) {
          if (key !== 'image') {
            formDataObj[key] = value;
          }
        }
        
        // Appeler l'API de mise à jour
        await api.patch(API_ENDPOINTS.DONS.UPDATE(donUuid), formDataObj);
        console.log("✅ [IA] Don mis à jour avec succès");
      }
      
      const imageFile = formData.get("image") as File;
      if (imageFile) {
        setSavedImageFile(imageFile);
        console.log("✅ Image sauvegardée pour les suggestions");
      }
      
      // ✅ Si des suggestions ont été acceptées, on force la publication directement
      const hasAcceptedSuggestions = suggestionsAcceptees && 
        (Array.isArray(suggestionsAcceptees) ? suggestionsAcceptees.length > 0 : true);
      
      // ✅ ÉTAPE 2: Envoyer à l'IA pour modération avec forcePublish si suggestions acceptées
      const moderationResponse = await api.post(
        API_ENDPOINTS.IA_MODERATION.PUBLIER_DON,
        {
          uuid: donUuid,
          forcePublish: hasAcceptedSuggestions, // ✅ FORCER la publication si suggestions acceptées
          bypassIA: hasAcceptedSuggestions,      // ✅ Bypasser l'IA si suggestions acceptées
          suggestionsAcceptees: suggestionsAcceptees,
        }
      );
      
      const donData = moderationResponse.data;
      console.log("🤖 [IA] Réponse IA reçue:", donData);
      
      if (!donData) {
        console.error("❌ [IA] Réponse API invalide");
        showNotification(
          "❌ Erreur de communication avec le serveur. Veuillez réessayer.",
          'error',
          false
        );
        setTimeout(() => {
          onHide();
          resetForm();
        }, 5000);
        setLoading(false);
        return;
      }
      
      const suggestions = donData._suggestions || [];
      const estBloque = donData?.statut === 'bloque' || donData?.est_bloque === true;
      const estPublie = donData?.statut === 'publie' || donData?.estPublie === true;
      
      console.log("🔍 [IA] Analyse:", { 
        statut: donData?.statut, 
        estBloque, 
        estPublie, 
        suggestionsCount: suggestions.length,
        hasAcceptedSuggestions
      });
      
      // ✅ Si des suggestions sont reçues et qu'on n'en a pas encore envoyé
      if (suggestions.length > 0 && !hasAcceptedSuggestions) {
        console.log("💡 [IA] Suggestions reçues:", suggestions.length);
        setAiSuggestions(suggestions);
        setPendingDonData({
          ...donData,
          uuid: donUuid,
          image: imageFile || savedImageFile,
        });
        setShowAISuggestions(true);
        setLoading(false);
        return;
      }
      
      if (estBloque && !hasAcceptedSuggestions) {
        const categories = donData.ai_moderation_categories || [];
        let message = donData.moderation_message || `❌ Votre don a été rejeté : ${categories.join(', ')}`;
        message = message.replace(/\s*\(sans analyse d'image\)\s*/g, '');
        
        if (!message.startsWith('❌') && !message.startsWith('✅')) {
          message = `❌ ${message}`;
        }
        
        console.log("🚫 [IA] Rejet:", message);
        showNotification(message, 'error', false);
        
        setTimeout(() => {
          onHide();
          resetForm();
        }, 10000);
        
        setLoading(false);
        return;
      }
      
      if (estPublie || hasAcceptedSuggestions) {
        let successMessage = donData.moderation_message?.includes('✅') 
          ? donData.moderation_message
          : hasAcceptedSuggestions
            ? "✅ Félicitations ! Vos modifications ont été acceptées et votre annonce a été publiée avec succès !"
            : "✅ Félicitations ! Votre don a été automatiquement approuvé et publié par notre IA !";
        
        successMessage = successMessage.replace(/\s*\(sans analyse d'image\)\s*/g, '');
        
        console.log("✅ [IA] Succès:", successMessage);
        showNotification(successMessage, 'success', true);
        
        setTimeout(() => {
          onHide();
          resetForm();
        }, 3000);
        
        setLoading(false);
        return;
      }
      
      console.error("❌ [IA] Statut inattendu:", donData?.statut);
      showNotification("❌ Une erreur est survenue lors de la publication.", 'error', false);
      
      setTimeout(() => {
        onHide();
        resetForm();
      }, 7000);
      
      setLoading(false);
      
    } catch (error: any) {
      console.error("❌ [IA] Erreur publication don:", error);
      
      let errorMessage = "❌ Une erreur est survenue lors de la publication.";
      
      if (error.message?.includes("401")) {
        errorMessage = "❌ Session expirée. Veuillez vous reconnecter.";
        onLoginRequired();
      } else if (error.message?.includes("500")) {
        errorMessage = "❌ Erreur serveur. Veuillez réessayer plus tard.";
        showNotification(errorMessage, 'error', false);
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
        showNotification(errorMessage, 'error', false);
      } else {
        showNotification(errorMessage, 'error', false);
      }
      
      setSubmitError(error.message || "Erreur lors de la publication");
      setLoading(false);
    }
  };

  const publishEchangeWithAI = async (formData: FormData, suggestionsAcceptees?: { suggestionId: string; champ: string; texteModifie?: string } | { suggestionId: string; champ: string; texteModifie?: string }[]) => {
    try {
      setLoading(true);
      setSubmitError(null);
      
      console.log("🔄 [IA] Début publication de l'échange avec IA...");
      console.log("📝 [IA] suggestionsAcceptees:", suggestionsAcceptees);
      
      // ✅ ÉTAPE 1: Créer l'échange UNIQUEMENT s'il n'existe pas encore
      let echangeUuid = currentDonUuid;
      
      if (!echangeUuid) {
        const createResponse = await api.post(API_ENDPOINTS.ECHANGES.CREATE, formData, {
          isFormData: true,
        });
        
        echangeUuid = createResponse.data?.uuid || createResponse.uuid;
        
        if (!echangeUuid) {
          throw new Error("Impossible de récupérer l'UUID de l'échange");
        }
        
        console.log("✅ [IA] Échange créé avec UUID:", echangeUuid);
        setCurrentDonUuid(echangeUuid);
      } else {
        // ✅ Si on a déjà un UUID, on met à jour l'échange existant
        console.log("🔄 [IA] Mise à jour de l'échange existant avec UUID:", echangeUuid);
        
        const formDataObj: any = {};
        for (const [key, value] of formData.entries()) {
          if (key !== 'image') {
            formDataObj[key] = value;
          }
        }
        
        await api.put(API_ENDPOINTS.ECHANGES.UPDATE(echangeUuid), formDataObj);
        console.log("✅ [IA] Échange mis à jour avec succès");
      }
      
      const imageFile = formData.get("image") as File;
      if (imageFile) {
        setSavedImageFile(imageFile);
        console.log("✅ Image sauvegardée pour les suggestions");
      }
      
      // ✅ Si des suggestions ont été acceptées, on force la publication directement
      const hasAcceptedSuggestions = suggestionsAcceptees && 
        (Array.isArray(suggestionsAcceptees) ? suggestionsAcceptees.length > 0 : true);
      
      // ✅ ÉTAPE 2: Envoyer à l'IA pour modération avec forcePublish si suggestions acceptées
      const moderationResponse = await api.post(
        API_ENDPOINTS.IA_MODERATION.PUBLIER_DON,
        {
          uuid: echangeUuid,
          forcePublish: hasAcceptedSuggestions,
          bypassIA: hasAcceptedSuggestions,
          suggestionsAcceptees: suggestionsAcceptees,
        }
      );
      
      const echangeData = moderationResponse.data;
      console.log("🤖 [IA] Réponse IA reçue");
      
      if (!echangeData) {
        console.error("❌ [IA] Réponse API invalide");
        showNotification(
          "❌ Erreur de communication avec le serveur. Veuillez réessayer.",
          'error',
          false
        );
        setTimeout(() => {
          onHide();
          resetForm();
        }, 5000);
        setLoading(false);
        return;
      }
      
      const suggestions = echangeData._suggestions || [];
      const estBloque = echangeData?.statut === 'bloque' || echangeData?.statut === 'Bloquée' || echangeData?.estBloque === true;
      const estPublie = echangeData?.statut === 'publie' || echangeData?.statut === 'Publiée' || echangeData?.estPublie === true;
      
      console.log("🔍 [IA] Analyse:", { statut: echangeData?.statut, estBloque, estPublie, suggestionsCount: suggestions.length });
      
      if (suggestions.length > 0 && !hasAcceptedSuggestions) {
        console.log("💡 [IA] Suggestions reçues:", suggestions.length);
        setAiSuggestions(suggestions);
        setPendingDonData({
          ...echangeData,
          uuid: echangeUuid,
          image: imageFile || savedImageFile,
        });
        setShowAISuggestions(true);
        setLoading(false);
        return;
      }
      
      if (estBloque && !hasAcceptedSuggestions) {
        const categories = echangeData.ai_moderation_categories || [];
        let message = echangeData.moderation_message || `❌ Votre échange a été rejeté : ${categories.join(', ')}`;
        message = message.replace(/\s*\(sans analyse d'image\)\s*/g, '');
        
        if (!message.startsWith('❌') && !message.startsWith('✅')) {
          message = `❌ ${message}`;
        }
        
        console.log("🚫 [IA] Rejet:", message);
        showNotification(message, 'error', false);
        
        setTimeout(() => {
          onHide();
          resetForm();
        }, 10000);
        
        setLoading(false);
        return;
      }
      
      if (estPublie || hasAcceptedSuggestions) {
        let successMessage = echangeData.moderation_message?.includes('✅') 
          ? echangeData.moderation_message
          : hasAcceptedSuggestions
            ? "✅ Félicitations ! Vos modifications ont été acceptées et votre annonce a été publiée avec succès !"
            : "✅ Félicitations ! Votre échange a été automatiquement approuvé et publié par notre IA !";
        
        successMessage = successMessage.replace(/\s*\(sans analyse d'image\)\s*/g, '');
        
        console.log("✅ [IA] Succès:", successMessage);
        showNotification(successMessage, 'success', true);
        
        setTimeout(() => {
          onHide();
          resetForm();
        }, 3000);
        
        setLoading(false);
        return;
      }
      
      console.error("❌ [IA] Statut inattendu:", echangeData?.statut);
      showNotification("❌ Une erreur est survenue lors de la publication.", 'error', false);
      
      setTimeout(() => {
        onHide();
        resetForm();
      }, 7000);
      
      setLoading(false);
      
    } catch (error: any) {
      console.error("❌ [IA] Erreur publication échange:", error);
      
      let errorMessage = "❌ Une erreur est survenue lors de la publication.";
      
      if (error.message?.includes("401")) {
        errorMessage = "❌ Session expirée. Veuillez vous reconnecter.";
        onLoginRequired();
      } else if (error.message?.includes("500")) {
        errorMessage = "❌ Erreur serveur. Veuillez réessayer plus tard.";
        showNotification(errorMessage, 'error', false);
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
        showNotification(errorMessage, 'error', false);
      } else {
        showNotification(errorMessage, 'error', false);
      }
      
      setSubmitError(error.message || "Erreur lors de la publication");
      setLoading(false);
    }
  };

  const publishProduitWithAI = async (formData: FormData, suggestionsAcceptees?: { suggestionId: string; champ: string; texteModifie?: string } | { suggestionId: string; champ: string; texteModifie?: string }[]) => {
    try {
      if (isVendeur && adType === "sale") {
        if (!verificationBoutiqueDone) {
          console.log("⏳ Vérification des boutiques en cours...");
          setSubmitError("Vérification des boutiques en cours, veuillez patienter...");
          setLoading(false);
          return;
        }
        
        if (loadingBoutiques) {
          console.log("⏳ Chargement des boutiques en cours...");
          setSubmitError("Chargement des boutiques en cours, veuillez patienter...");
          setLoading(false);
          return;
        }
        
        if (!hasActiveBoutique) {
          console.log("🏪 Vendeur sans boutique, impossible de publier");
          setSubmitError("Vous devez créer une boutique avant de pouvoir publier un produit. Veuillez créer votre boutique d'abord.");
          setShowBoutiqueModal(true);
          setLoading(false);
          return;
        }
        
        if (!venteData.boutiqueUuid) {
          console.log("⚠️ Vendeur avec boutique mais aucune sélectionnée");
          setSubmitError("Veuillez sélectionner une boutique pour vendre ce produit");
          setLoading(false);
          return;
        }
        
        console.log("✅ Vérification boutique réussie, publication en cours...");
      }
      
      setLoading(true);
      setSubmitError(null);
      
      console.log("🛒 [IA] Début publication du produit avec IA...");
      console.log("📝 [IA] suggestionsAcceptees:", suggestionsAcceptees);
      console.log("📝 [IA] boutiqueUuid:", venteData.boutiqueUuid);
      
      // ✅ ÉTAPE 1: Créer le produit UNIQUEMENT s'il n'existe pas encore
      let produitUuid = currentDonUuid;
      
      if (!produitUuid) {
        const createResponse = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
          isFormData: true,
        });
        
        produitUuid = createResponse.data?.uuid || createResponse.uuid;
        
        if (!produitUuid) {
          throw new Error("Impossible de récupérer l'UUID du produit");
        }
        
        console.log("✅ [IA] Produit créé avec UUID:", produitUuid);
        setCurrentDonUuid(produitUuid);
      } else {
        // ✅ Si on a déjà un UUID, on met à jour le produit existant
        console.log("🔄 [IA] Mise à jour du produit existant avec UUID:", produitUuid);
        
        const formDataObj: any = {};
        for (const [key, value] of formData.entries()) {
          if (key !== 'image') {
            formDataObj[key] = value;
          }
        }
        
        await api.put(API_ENDPOINTS.PRODUCTS.UPDATE(produitUuid), formDataObj);
        console.log("✅ [IA] Produit mis à jour avec succès");
      }
      
      const imageFile = formData.get("image") as File;
      if (imageFile) {
        setSavedImageFile(imageFile);
        console.log("✅ Image sauvegardée pour les suggestions");
      }
      
      // ✅ Si des suggestions ont été acceptées, on force la publication directement
      const hasAcceptedSuggestions = suggestionsAcceptees && 
        (Array.isArray(suggestionsAcceptees) ? suggestionsAcceptees.length > 0 : true);
      
      // ✅ ÉTAPE 2: Envoyer à l'IA pour modération avec forcePublish si suggestions acceptées
      const moderationResponse = await api.post(
        API_ENDPOINTS.IA_MODERATION.PUBLIER_DON,
        {
          uuid: produitUuid,
          forcePublish: hasAcceptedSuggestions,
          bypassIA: hasAcceptedSuggestions,
          suggestionsAcceptees: suggestionsAcceptees,
        }
      );
      
      const produitData = moderationResponse.data;
      console.log("🤖 [IA] Réponse IA reçue");
      
      if (!produitData) {
        console.error("❌ [IA] Réponse API invalide");
        showNotification(
          "❌ Erreur de communication avec le serveur. Veuillez réessayer.",
          'error',
          false
        );
        setTimeout(() => {
          onHide();
          resetForm();
        }, 5000);
        setLoading(false);
        return;
      }
      
      const suggestions = produitData._suggestions || [];
      const estBloque = produitData?.statut === 'bloque' || produitData?.statut === 'Bloqué' || produitData?.estBloque === true;
      const estPublie = produitData?.statut === 'publie' || produitData?.statut === 'Publié' || produitData?.estPublie === true;
      
      console.log("🔍 [IA] Analyse:", { statut: produitData?.statut, estBloque, estPublie, suggestionsCount: suggestions.length });
      
      if (suggestions.length > 0 && !hasAcceptedSuggestions) {
        console.log("💡 [IA] Suggestions reçues:", suggestions.length);
        setAiSuggestions(suggestions);
        setPendingDonData({
          ...produitData,
          uuid: produitUuid,
          image: imageFile || savedImageFile,
        });
        setShowAISuggestions(true);
        setLoading(false);
        return;
      }
      
      if (estBloque && !hasAcceptedSuggestions) {
        const categories = produitData.ai_moderation_categories || [];
        let message = produitData.moderation_message || `❌ Votre produit a été rejeté : ${categories.join(', ')}`;
        message = message.replace(/\s*\(sans analyse d'image\)\s*/g, '');
        
        if (!message.startsWith('❌') && !message.startsWith('✅')) {
          message = `❌ ${message}`;
        }
        
        console.log("🚫 [IA] Rejet:", message);
        showNotification(message, 'error', false);
        
        setTimeout(() => {
          onHide();
          resetForm();
        }, 10000);
        
        setLoading(false);
        return;
      }
      
      if (estPublie || hasAcceptedSuggestions) {
        let successMessage = produitData.moderation_message?.includes('✅') 
          ? produitData.moderation_message
          : hasAcceptedSuggestions
            ? "✅ Félicitations ! Vos modifications ont été acceptées et votre annonce a été publiée avec succès !"
            : "✅ Félicitations ! Votre produit a été automatiquement approuvé et publié par notre IA !";
        
        successMessage = successMessage.replace(/\s*\(sans analyse d'image\)\s*/g, '');
        
        console.log("✅ [IA] Succès:", successMessage);
        showNotification(successMessage, 'success', true);
        
        setTimeout(() => {
          onHide();
          resetForm();
        }, 3000);
        
        setLoading(false);
        return;
      }
      
      console.error("❌ [IA] Statut inattendu:", produitData?.statut);
      showNotification("❌ Une erreur est survenue lors de la publication.", 'error', false);
      
      setTimeout(() => {
        onHide();
        resetForm();
      }, 7000);
      
      setLoading(false);
      
    } catch (error: any) {
      console.error("❌ [IA] Erreur publication produit:", error);
      
      let errorMessage = "❌ Une erreur est survenue lors de la publication.";
      
      if (error.message?.includes("401")) {
        errorMessage = "❌ Session expirée. Veuillez vous reconnecter.";
        onLoginRequired();
      } else if (error.message?.includes("500")) {
        errorMessage = "❌ Erreur serveur. Veuillez réessayer plus tard.";
        showNotification(errorMessage, 'error', false);
      } else if (error.message) {
        errorMessage = `❌ ${error.message}`;
        showNotification(errorMessage, 'error', false);
      } else {
        showNotification(errorMessage, 'error', false);
      }
      
      setSubmitError(error.message || "Erreur lors de la publication");
      setLoading(false);
    }
  };

  // ============================================
  // 9. LES FONCTIONS DE PUBLICATION MANUELLE (MODÉRATION MANUELLE)
  // ============================================
  const submitDonManually = async (formData: FormData) => {
    try {
      setLoading(true);
      
      console.log("⚠️ [MANUEL] Publication manuelle du don (IA désactivée)");
      console.log("⏳ [MANUEL] Annonce en attente de validation par un modérateur");
      
      const result = await api.post(API_ENDPOINTS.DONS.CREATE, formData, {
        isFormData: true,
      });
      
      console.log("✅ [MANUEL] Don créé avec succès:", result.data?.uuid);
      
      showNotification(
        "⏳ Votre don a été soumis avec succès et est en attente de validation par un modérateur. Vous serez notifié dès sa publication.",
        'info',
        true
      );
      
      setTimeout(() => {
        onHide();
        resetForm();
      }, 4000);
      
    } catch (error: any) {
      console.error("❌ [MANUEL] Erreur publication don:", error);
      setSubmitError(error.message || "Erreur lors de la publication");
      showNotification(
        error.message || "❌ Erreur lors de la publication",
        'error',
        false
      );
    } finally {
      setLoading(false);
    }
  };

  const submitEchangeManually = async (formData: FormData) => {
    try {
      setLoading(true);
      
      console.log("⚠️ [MANUEL] Publication manuelle de l'échange (IA désactivée)");
      console.log("⏳ [MANUEL] Annonce en attente de validation par un modérateur");
      
      const result = await api.post(API_ENDPOINTS.ECHANGES.CREATE, formData, {
        isFormData: true,
      });
      
      console.log("✅ [MANUEL] Échange créé avec succès:", result.data?.uuid);
      
      showNotification(
        "⏳ Votre échange a été soumis avec succès et est en attente de validation par un modérateur. Vous serez notifié dès sa publication.",
        'info',
        true
      );
      
      setTimeout(() => {
        onHide();
        resetForm();
      }, 4000);
      
    } catch (error: any) {
      console.error("❌ [MANUEL] Erreur publication échange:", error);
      setSubmitError(error.message || "Erreur lors de la publication");
      showNotification(
        error.message || "❌ Erreur lors de la publication",
        'error',
        false
      );
    } finally {
      setLoading(false);
    }
  };

  const submitVenteManually = async (formData: FormData) => {
    try {
      setLoading(true);
      
      console.log("⚠️ [MANUEL] Publication manuelle du produit (IA désactivée)");
      console.log("⏳ [MANUEL] Annonce en attente de validation par un modérateur");
      
      const result = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
        isFormData: true,
      });
      
      console.log("✅ [MANUEL] Produit créé avec succès:", result.data?.uuid);
      
      showNotification(
        "⏳ Votre produit a été soumis avec succès et est en attente de validation par un modérateur. Vous serez notifié dès sa publication.",
        'info',
        true
      );
      
      setTimeout(() => {
        onHide();
        resetForm();
      }, 4000);
      
    } catch (error: any) {
      console.error("❌ [MANUEL] Erreur publication produit:", error);
      setSubmitError(error.message || "Erreur lors de la publication");
      showNotification(
        error.message || "❌ Erreur lors de la publication",
        'error',
        false
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 10. LES FONCTIONS DE GESTION DES SUGGESTIONS
  // ============================================
  const handleAcceptSuggestion = async (suggestion: Suggestion) => {
    if (!pendingDonData) return;
    
    try {
      setLoading(true);
      setShowAISuggestions(false);
      
      console.log("🔍 pendingDonData avant acceptation:", {
        uuid: pendingDonData.uuid,
        titre: pendingDonData.titre,
        description: pendingDonData.description,
        lieu_retrait: pendingDonData.lieu_retrait,
        hasImage: !!pendingDonData.image,
        savedImage: !!savedImageFile
      });
      
      const updatedData = { ...pendingDonData };
      let texteModifie = "";
      
      if (suggestion.champ === "titre") {
        updatedData.titre = suggestion.suggestedText;
        texteModifie = suggestion.suggestedText;
      } else if (suggestion.champ === "description") {
        updatedData.description = suggestion.suggestedText;
        texteModifie = suggestion.suggestedText;
      } else if (suggestion.champ === "localisation") {
        updatedData.lieu_retrait = suggestion.suggestedText;
        texteModifie = suggestion.suggestedText;
      }
      
      const formData = new FormData();
      
      formData.append("nom", updatedData.titre?.trim() || "");
      formData.append("lieu_retrait", updatedData.lieu_retrait?.trim() || "");
      formData.append("categorie_uuid", updatedData.categorie_uuid || "");
      formData.append("description", updatedData.description?.trim() || "");
      formData.append("quantite", updatedData.quantite || "1");
      
      if (adType === "sale") {
        formData.append("libelle", updatedData.titre?.trim() || "");
        
        if (isVendeur && venteData.boutiqueUuid) {
          formData.append("boutiqueUuid", venteData.boutiqueUuid);
          if (venteData.boutiqueNom) {
            formData.append("boutiqueNom", venteData.boutiqueNom);
          }
        }
        
        formData.append("prix", venteData.prix || "0");
        formData.append("lieu", venteData.lieu || updatedData.lieu_retrait || "");
        formData.append("condition", venteData.condition || "neuf");
        formData.append("type", venteData.type || "");
        formData.append("disponible", String(venteData.disponible ?? true));
        formData.append("statut", venteData.statut || "publie");
        formData.append("etoile", venteData.etoile || "5");
        formData.append("garantie", venteData.garantie || "non");
      }
      
      const imageToSend = updatedData.image || savedImageFile;
      if (imageToSend) {
        formData.append("image", imageToSend);
      }
      
      const suggestionAcceptee = {
        suggestionId: suggestion.id,
        champ: suggestion.champ,
        texteModifie: texteModifie,
      };
      
      if (adType === "don") {
        await publishDonWithAI(formData, suggestionAcceptee);
      } else if (adType === "exchange") {
        await publishEchangeWithAI(formData, suggestionAcceptee);
      } else {
        await publishProduitWithAI(formData, suggestionAcceptee);
      }
      
    } catch (error: any) {
      console.error("❌ Erreur acceptation suggestion:", error);
      setSubmitError(error.message);
      setLoading(false);
    }
  };

  const handleAcceptAllSuggestions = async () => {
    if (!pendingDonData || aiSuggestions.length === 0) return;
    
    try {
      setLoading(true);
      setShowAISuggestions(false);
      
      console.log("🔍 pendingDonData avant acceptation de toutes les suggestions:", {
        uuid: pendingDonData.uuid,
        titre: pendingDonData.titre,
        description: pendingDonData.description,
        lieu_retrait: pendingDonData.lieu_retrait,
        hasImage: !!pendingDonData.image,
        savedImage: !!savedImageFile
      });
      
      // ✅ Appliquer TOUTES les suggestions à updatedData
      const updatedData = { ...pendingDonData };
      
      // ✅ Stocker TOUTES les suggestions acceptées
      const suggestionsAcceptees: { suggestionId: string; champ: string; texteModifie: string }[] = [];
      
      aiSuggestions.forEach((suggestion) => {
        let texteModifie = "";
        if (suggestion.champ === "titre") {
          updatedData.titre = suggestion.suggestedText;
          texteModifie = suggestion.suggestedText;
        } else if (suggestion.champ === "description") {
          updatedData.description = suggestion.suggestedText;
          texteModifie = suggestion.suggestedText;
        } else if (suggestion.champ === "localisation") {
          updatedData.lieu_retrait = suggestion.suggestedText;
          texteModifie = suggestion.suggestedText;
        }
        
        suggestionsAcceptees.push({
          suggestionId: suggestion.id,
          champ: suggestion.champ,
          texteModifie: texteModifie,
        });
      });
      
      console.log(`✅ ${suggestionsAcceptees.length} suggestions acceptées:`, suggestionsAcceptees);
      
      const formData = new FormData();
      
      formData.append("nom", updatedData.titre?.trim() || "");
      formData.append("lieu_retrait", updatedData.lieu_retrait?.trim() || "");
      formData.append("categorie_uuid", updatedData.categorie_uuid || "");
      formData.append("description", updatedData.description?.trim() || "");
      formData.append("quantite", updatedData.quantite || "1");
      
      if (adType === "sale") {
        formData.append("libelle", updatedData.titre?.trim() || "");
        
        if (isVendeur && venteData.boutiqueUuid) {
          formData.append("boutiqueUuid", venteData.boutiqueUuid);
          if (venteData.boutiqueNom) {
            formData.append("boutiqueNom", venteData.boutiqueNom);
          }
        }
        
        formData.append("prix", venteData.prix || "0");
        formData.append("lieu", venteData.lieu || updatedData.lieu_retrait || "");
        formData.append("condition", venteData.condition || "neuf");
        formData.append("type", venteData.type || "");
        formData.append("disponible", String(venteData.disponible ?? true));
        formData.append("statut", venteData.statut || "publie");
        formData.append("etoile", venteData.etoile || "5");
        formData.append("garantie", venteData.garantie || "non");
      }
      
      const imageToSend = updatedData.image || savedImageFile;
      if (imageToSend) {
        formData.append("image", imageToSend);
      }
      
      // ✅ Envoyer TOUTES les suggestions acceptées avec forcePublish = true
      if (adType === "don") {
        await publishDonWithAI(formData, suggestionsAcceptees);
      } else if (adType === "exchange") {
        await publishEchangeWithAI(formData, suggestionsAcceptees);
      } else {
        await publishProduitWithAI(formData, suggestionsAcceptees);
      }
      
    } catch (error: any) {
      console.error("❌ Erreur acceptation suggestions:", error);
      setSubmitError(error.message);
      setLoading(false);
    }
  };

  const handleRejectAllSuggestions = async () => {
    if (!pendingDonData) return;
    
    try {
      setLoading(true);
      setShowAISuggestions(false);
      
      const formData = new FormData();
      formData.append("nom", pendingDonData.titre?.trim() || "");
      formData.append("lieu_retrait", pendingDonData.lieu_retrait?.trim() || "");
      formData.append("categorie_uuid", pendingDonData.categorie_uuid || "");
      formData.append("description", pendingDonData.description?.trim() || "");
      formData.append("quantite", pendingDonData.quantite || "1");
      
      if (adType === "sale") {
        formData.append("libelle", pendingDonData.titre?.trim() || "");
        
        if (isVendeur && venteData.boutiqueUuid) {
          formData.append("boutiqueUuid", venteData.boutiqueUuid);
          if (venteData.boutiqueNom) {
            formData.append("boutiqueNom", venteData.boutiqueNom);
          }
        }
        
        formData.append("prix", venteData.prix || "0");
        formData.append("lieu", venteData.lieu || pendingDonData.lieu_retrait || "");
        formData.append("condition", venteData.condition || "neuf");
        formData.append("type", venteData.type || "");
        formData.append("disponible", String(venteData.disponible ?? true));
        formData.append("statut", venteData.statut || "publie");
        formData.append("etoile", venteData.etoile || "5");
        formData.append("garantie", venteData.garantie || "non");
      }
      
      const imageToSend = pendingDonData.image || savedImageFile;
      if (imageToSend) {
        formData.append("image", imageToSend);
      }
      
      if (adType === "don") {
        await publishDonWithAI(formData);
      } else if (adType === "exchange") {
        await publishEchangeWithAI(formData);
      } else {
        await publishProduitWithAI(formData);
      }
      
    } catch (error: any) {
      setSubmitError(error.message);
      setLoading(false);
    }
  };

  // ============================================
  // 11. LES FONCTIONS DE SOUMISSION
  // ============================================
  const submitDon = async (): Promise<void> => {
    console.log("📝 [submitDon] Début - aiModerationEnabled:", aiModerationEnabled);
    
    if (!donData.titre?.trim()) {
      setSubmitError("Le titre du don est obligatoire");
      return;
    }

    if (!donData.lieu_retrait?.trim()) {
      setSubmitError("Le lieu de retrait est obligatoire");
      return;
    }

    const categorieAEnvoyer = donData.sous_categorie_uuid || donData.categorie_uuid;
    if (!categorieAEnvoyer) {
      setSubmitError("Veuillez sélectionner une catégorie");
      return;
    }

    if (!donData.image) {
      setSubmitError("Veuillez ajouter une photo");
      return;
    }

    if (donData.image) {
      setSavedImageFile(donData.image);
    }

    const formData = new FormData();

    formData.append("nom", donData.titre.trim());
    formData.append("lieu_retrait", donData.lieu_retrait.trim());
    formData.append("categorie_uuid", categorieAEnvoyer);
    formData.append("type_don", "don");
    formData.append("localisation", donData.lieu_retrait.trim());
    formData.append("numero", donData.numero?.trim() || "");
    formData.append("nom_donataire", donData.nom_donataire?.trim() || "");
    formData.append("quantite", donData.quantite?.toString() || "1");
    formData.append("description", donData.description?.trim() || "");

    if (donData.condition) {
      formData.append("condition", donData.condition);
    }

    if (donData.disponibilite) {
      formData.append("disponibilite", donData.disponibilite);
    }

    if (donData.image) {
      formData.append("image", donData.image);
    }

    console.log("📤 [submitDon] Envoi du don");
    console.log("🔘 [submitDon] Chemin choisi:", aiModerationEnabled ? "IA" : "Manuel (modération manuelle)");

    if (aiModerationEnabled) {
      await publishDonWithAI(formData);
    } else {
      await submitDonManually(formData);
    }
  };

  const submitEchange = async (): Promise<void> => {
    console.log("📝 [submitEchange] Début - aiModerationEnabled:", aiModerationEnabled);
    
    if (!echangeData.nomElementEchange?.trim()) {
      setSubmitError("Le titre de l'échange est obligatoire");
      return;
    }

    if (!echangeData.objetDemande?.trim()) {
      setSubmitError("L'objet recherché est obligatoire");
      return;
    }

    if (!echangeData.prix?.trim()) {
      setSubmitError("Le prix estimé est obligatoire");
      return;
    }

    const categorieAEnvoyer = echangeData.final_categorie_uuid || echangeData.categorie_uuid;
    if (!categorieAEnvoyer) {
      setSubmitError("Veuillez sélectionner une catégorie");
      return;
    }

    if (!echangeData.image) {
      setSubmitError("Veuillez ajouter une photo");
      return;
    }

    if (echangeData.image) {
      setSavedImageFile(echangeData.image);
    }

    const formData = new FormData();

    formData.append("nomElementEchange", echangeData.nomElementEchange.trim());
    formData.append("objetDemande", echangeData.objetDemande.trim());
    formData.append("prix", echangeData.prix.trim());
    formData.append("categorie_uuid", categorieAEnvoyer);
    formData.append("image", echangeData.image);
    formData.append("objetPropose", echangeData.objetDemande.trim() || "Objet à échanger");
    formData.append("quantite", echangeData.quantite?.toString() || "1");
    formData.append("message", echangeData.message?.trim() || "");
    formData.append("nom_initiateur", "vendeur");
    formData.append("type_destinataire", "autre");
    formData.append("typeEchange", "produit");
    formData.append("numero", echangeData.numero?.trim() || "+2250000000000");

    if (echangeData.sous_categorie_uuid) {
      formData.append("sous_categorie_uuid", echangeData.sous_categorie_uuid);
    }

    if (aiModerationEnabled) {
      await publishEchangeWithAI(formData);
    } else {
      await submitEchangeManually(formData);
    }
  };

  const submitVente = async (): Promise<void> => {
    console.log("🚀 Début submitVente");

    if (!venteData.libelle?.trim()) {
      setSubmitError("Le nom du produit est obligatoire");
      return;
    }

    if (!venteData.prix?.trim()) {
      setSubmitError("Le prix est obligatoire");
      return;
    }

    const categorieAEnvoyer = venteData.final_categorie_uuid || venteData.categorie_uuid;
    if (!categorieAEnvoyer) {
      setSubmitError("Veuillez sélectionner une catégorie");
      return;
    }

    if (!venteData.image) {
      setSubmitError("Veuillez ajouter une photo");
      return;
    }

    if (venteData.image) {
      setSavedImageFile(venteData.image);
    }

    if (isVendeur) {
      if (!verificationBoutiqueDone) {
        setSubmitError("Vérification des boutiques en cours, veuillez patienter...");
        return;
      }
      
      if (loadingBoutiques) {
        setSubmitError("Chargement des boutiques en cours, veuillez patienter...");
        return;
      }
      
      if (!hasActiveBoutique) {
        setSubmitError("Vous devez créer une boutique avant de pouvoir publier un produit.");
        setShowBoutiqueModal(true);
        return;
      }
      
      if (!venteData.boutiqueUuid) {
        setSubmitError("Veuillez sélectionner une boutique pour vendre ce produit");
        return;
      }
    }

    const boutiqueId = venteData.boutiqueUuid;
    console.log("📝 boutiqueUuid à envoyer:", boutiqueId);

    const formData = new FormData();

    if (boutiqueId) {
      formData.append("boutiqueUuid", boutiqueId);
      if (venteData.boutiqueNom) {
        formData.append("boutiqueNom", venteData.boutiqueNom);
      }
    } else if (isVendeur) {
      console.error("❌ ERREUR: Vendeur sans boutiqueUuid!");
      setSubmitError(
        "Veuillez sélectionner une boutique pour vendre ce produit",
      );
      setLoading(false);
      return;
    }

    formData.append("libelle", venteData.libelle.trim());
    formData.append("type", venteData.type.trim());
    formData.append("disponible", String(venteData.disponible));
    formData.append("categorie_uuid", categorieAEnvoyer);
    
    if (venteData.sous_categorie_uuid) {
      formData.append("sous_categorie_uuid", venteData.sous_categorie_uuid);
    }

    formData.append("statut", venteData.statut);
    formData.append("etoile", venteData.etoile);
    formData.append("prix", venteData.prix.trim());
    formData.append("quantite", venteData.quantite);
    formData.append("description", venteData.description.trim());
    formData.append("lieu", venteData.lieu.trim());
    formData.append("condition", venteData.condition);
    formData.append("garantie", venteData.garantie);

    if (venteData.image) {
      formData.append("image", venteData.image);
    }

    if (aiModerationEnabled) {
      await publishProduitWithAI(formData);
    } else {
      await submitVenteManually(formData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    if (adType === "sale" && isVendeur && !venteData.boutiqueUuid) {
      setSubmitError(
        "Veuillez sélectionner une boutique pour vendre ce produit",
      );
      return;
    }

    try {
      switch (adType) {
        case "don":
          await submitDon();
          break;
        case "exchange":
          await submitEchange();
          break;
        case "sale":
          await submitVente();
          break;
      }
    } catch (error) {
      console.error("❌ Erreur dans handleSubmit:", error);
    }
  };

  const resetForm = () => {
    setAdType(null);
    setSaleMode("particulier");
    setDonData({
      description: "",
      type_don: "",
      localisation: "",
      lieu_retrait: "",
      image: null,
      categorie_uuid: "",
      sous_categorie_uuid: "",
      numero: "",
      quantite: "1",
      nom_donataire: "",
      titre: "",
      condition: "bon",
      disponibilite: "immediate",
    });
    setEchangeData({
      nomElementEchange: "",
      numero: "",
      nom_initiateur: "vendeur",
      typeEchange: "produit",
      sous_categorie_uuid: "",
      objetPropose: "",
      objetDemande: "",
      message: "",
      prix: "",
      categorie_uuid: "",
      image: null,
      quantite: "1",
      type_destinataire: "autre",
    });
    setVenteData({
      boutiqueUuid: "",
      sous_categorie_uuid: "",
      boutiqueNom: "",
      libelle: "",
      type: "",
      disponible: true,
      categorie_uuid: "",
      statut: "publie",
      etoile: "5",
      image: null,
      prix: "",
      quantite: "1",
      description: "",
      lieu: "",
      condition: "neuf",
      garantie: "non",
      saleMode: "particulier",
    });
    setImagePreview(null);
    setStep(1);
    setSubmitError(null);
    setBoutiques([]);
    setSelectedBoutique(null);
    setShowBoutiqueModal(false);
    setPendingVenteData(null);
    setAiSuggestions([]);
    setPendingDonData(null);
    setHasActiveBoutique(false);
    setVerificationBoutiqueDone(false);
    setBoutiqueInfo(null);
    setSavedImageFile(null);
    setCurrentDonUuid(null);
    boutiquePreselectedRef.current = false;
  };

  // ============================================
  // 12. LES FONCTIONS DE RENDU
  // ============================================
  const renderStep1 = () => (
    <div className="p-5">
      <div className="text-center mb-6">
        <div className="rounded-circle bg-primary bg-opacity-10 p-4 d-inline-flex align-items-center justify-content-center">
          <FontAwesomeIcon icon={faStore} className="text-primary fs-1" />
        </div>
        <h2 className="fw-bold text-dark mb-3">
          Comment souhaitez-vous partager ?
        </h2>
        <p className="text-muted fs-5">Choisissez le type d'annonce</p>
      </div>
      <div className="row g-4">
        {adTypeOptions.map((option) => {
          const isSelected = adType === option.id;
          const typeColors = colorsByType[option.id as keyof typeof colorsByType];

          return (
            <div key={option.id} className="col-md-4">
              <div
                className={`card h-100 border-0 shadow-lg-hover cursor-pointer transition-all`}
                onClick={() => selectAdType(option.id)}
                style={{
                  minHeight: "280px",
                  borderRadius: "20px",
                  background: isSelected ? typeColors.gradient : "white",
                  border: isSelected ? 'none' : `2px solid ${typeColors.light}`,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${typeColors.primary}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div
                    className="rounded-circle p-4 mb-4 transition-all"
                    style={{
                      background: isSelected ? "white" : typeColors.light,
                      transform: isSelected ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={option.icon}
                      className="fs-1"
                      style={{
                        color: isSelected ? typeColors.primary : typeColors.primary,
                      }}
                    />
                  </div>
                  <h4
                    className="fw-bold mb-3"
                    style={{
                      color: isSelected ? "white" : colors.oskar.black,
                    }}
                  >
                    {option.title}
                  </h4>
                  <p
                    className="mb-4"
                    style={{
                      color: isSelected ? "rgba(255,255,255,0.9)" : colors.oskar.black,
                    }}
                  >
                    {option.description}
                  </p>
                  {isSelected && (
                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                      style={{ width: "28px", height: "28px" }}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        style={{ color: typeColors.primary }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================================
  // 13. LE RENDU FINAL
  // ============================================
  if (!visible) return null;

  const getHeaderBackground = () => {
    if (!adType) return "white";
    return colorsByType[adType].light;
  };

  const getNotificationStyle = () => {
    if (pendingMessage?.includes('✅')) {
      return {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: faCheckCircle,
        title: "✅ Publication réussie !",
        borderColor: "#0b8b5c",
      };
    } else if (pendingMessage?.includes('⏳')) {
      return {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: faClock,
        title: "⏳ En attente de validation",
        borderColor: "#b45309",
      };
    } else {
      return {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        icon: faBan,
        title: "❌ Publication rejetée",
        borderColor: "#b91c1c",
      };
    }
  };

  return (
    <>
      {pendingMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 9999, maxWidth: "600px", width: "90%" }}
        >
          <div
            className="alert border-0 shadow-lg d-flex align-items-center"
            role="alert"
            style={{
              borderRadius: "16px",
              background: getNotificationStyle().background,
              color: "white",
              padding: "1.5rem 2rem",
              boxShadow: pendingMessage.includes('✅') 
                ? "0 10px 25px -5px rgba(16, 185, 129, 0.5)"
                : pendingMessage.includes('⏳')
                ? "0 10px 25px -5px rgba(245, 158, 11, 0.5)"
                : "0 10px 25px -5px rgba(239, 68, 68, 0.5)",
              borderLeft: `5px solid ${getNotificationStyle().borderColor}`,
            }}
          >
            <div className="d-flex align-items-center w-100">
              <div className="flex-shrink-0 me-4">
                <div className="rounded-circle bg-white bg-opacity-25 p-3 d-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <FontAwesomeIcon 
                    icon={getNotificationStyle().icon}
                    className="fs-2" 
                  />
                </div>
              </div>
              <div className="flex-grow-1">
                <h5 className="fw-bold mb-2 fs-5">
                  {getNotificationStyle().title}
                </h5>
                <p className="mb-0 opacity-90" style={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  {pendingMessage}
                </p>
                {pendingMessage.includes('❌') && (
                  <div className="mt-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faGavel} className="me-2 opacity-75" />
                    <small className="opacity-75">Conformément aux règles de la plateforme</small>
                  </div>
                )}
                {pendingMessage.includes('⏳') && (
                  <div className="mt-3 d-flex align-items-center">
                    <FontAwesomeIcon icon={faShield} className="me-2 opacity-75" />
                    <small className="opacity-75">Un modérateur examinera votre annonce sous 24h</small>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white opacity-75 ms-3"
                onClick={() => setPendingMessage(null)}
                aria-label="Close"
                style={{ 
                  background: "transparent", 
                  border: "none",
                  fontSize: "1.2rem"
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateBoutiqueModal
        show={showBoutiqueModal}
        loading={loadingBoutique}
        onClose={() => {
          setShowBoutiqueModal(false);
          setPendingVenteData(null);
        }}
        onCreate={handleCreateBoutique}
        vendeurData={user}
      />

      <VendeurRegisterModal
        visible={showVendeurRegisterModal}
        onHide={handleCloseVendeurRegister}
        onSwitchToLogin={() => {
          handleCloseVendeurRegister();
        }}
        onVendeurRegistered={handleVendeurRegistered}
        onSwitchToUser={() => {}}
      />

      <AISuggestionsModal
        visible={showAISuggestions}
        suggestions={aiSuggestions}
        onAcceptSuggestion={handleAcceptSuggestion}
        onAcceptAll={handleAcceptAllSuggestions}
        onRejectAll={handleRejectAllSuggestions}
        onClose={() => {
          setShowAISuggestions(false);
          setAiSuggestions([]);
          setPendingDonData(null);
          setLoading(false);
        }}
        type={adType || "don"}
      />

      {boutiqueCreationSuccess && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 9999, maxWidth: "600px", width: "90%" }}
        >
          <div
            className="alert alert-info border-0 shadow-lg d-flex align-items-center"
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #20800c 0%, #20800c 100%)",
              color: "white",
              padding: "1rem 1.5rem",
            }}
          >
            <div className="rounded-circle bg-white bg-opacity-25 p-2 me-3">
              <FontAwesomeIcon icon={faStore} className="fs-4" />
            </div>
            <div>
              <h5 className="fw-bold mb-1">Boutique créée avec succès !</h5>
              <p className="mb-0 opacity-90">
                Vous pouvez maintenant continuer la création de votre produit
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040, backdropFilter: "blur(5px)" }}
      />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content rounded-4 shadow-lg border-0 overflow-hidden">
            <div
              className="modal-header border-bottom-0 pb-0 position-relative"
              style={{
                background: getHeaderBackground(),
              }}
            >
              <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <div className="d-flex align-items-center">
                      <h2 className="modal-title fw-bold text-dark mb-1">
                        {step === 1
                          ? "Publier une annonce"
                          : adType === "don"
                            ? "Faire un Don"
                            : adType === "exchange"
                              ? "Proposer un Échange"
                              : "Vendre un Produit"}
                      </h2>
                      {aiModerationEnabled ? (
                        <span
                          className="badge rounded-pill ms-3 px-3 py-2"
                          style={{
                            background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                            color: "white",
                            fontSize: "0.8rem",
                          }}
                        >
                          <FontAwesomeIcon icon={faRobot} className="me-1" />
                          Modération IA active
                        </span>
                      ) : (
                        <span
                          className="badge rounded-pill ms-3 px-3 py-2"
                          style={{
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: "white",
                            fontSize: "0.8rem",
                          }}
                        >
                          <FontAwesomeIcon icon={faShield} className="me-1" />
                          Modération manuelle
                        </span>
                      )}
                    </div>
                    <p className="text-muted mb-0">
                      {step === 1
                        ? "Étape 1/3 : Sélection"
                        : step === 2
                          ? "Étape 2/3 : Détails"
                          : "Étape 3/3 : Récapitulatif"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onHide}
                    disabled={loading}
                  />
                </div>

                {submitError && (
                  <div className="alert alert-danger border-0 mb-3">
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      className="me-2"
                    />{" "}
                    {submitError}
                  </div>
                )}

                {categoriesError && (
                  <div className="alert alert-warning border-0 mb-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {categoriesError} - Utilisation des catégories par défaut
                  </div>
                )}

                <div className="stepper-wrapper">
                  <div className="stepper-item completed">
                    <div className="step-counter">1</div>
                    <div className="step-name">Type</div>
                  </div>
                  <div
                    className={`stepper-item ${
                      step >= 2 ? "completed" : ""
                    } ${step === 2 ? "active" : ""}`}
                  >
                    <div className="step-counter">2</div>
                    <div className="step-name">Détails</div>
                  </div>
                  <div
                    className={`stepper-item ${
                      step === 3 ? "completed active" : ""
                    }`}
                  >
                    <div className="step-counter">3</div>
                    <div className="step-name">Validation</div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="modal-body p-4"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              <form onSubmit={handleSubmit}>
                {step === 1 && renderStep1()}

                {adType === "don" && (
                  <DonForm
                    donData={donData}
                    conditions={conditions}
                    imagePreview={imagePreview}
                    onChange={setDonData}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={removeImage}
                    step={step}
                    categories={categories}
                    sous_categorie_uuid={donData.sous_categorie_uuid}
                  />
                )}

                {adType === "exchange" && (
                  <EchangeForm
                    echangeData={echangeData}
                    categories={categories}
                    conditions={conditions}
                    imagePreview={imagePreview}
                    onChange={setEchangeData}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={removeImage}
                    step={step}
                  />
                )}

                {adType === "sale" && (
                  <VenteForm
                    venteData={venteData}
                    conditions={conditions}
                    imagePreview={imagePreview}
                    onChange={setVenteData}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={removeImage}
                    step={step}
                    boutiques={boutiques}
                    selectedBoutique={selectedBoutique}
                    onBoutiqueChange={handleBoutiqueChange}
                    user={user || null}
                    saleMode={saleMode}
                    onOpenCreateBoutique={handleOpenCreateBoutique}
                    onOpenVendeurRegister={handleOpenVendeurRegister}
                    loadingBoutiques={loadingBoutiques}
                  />
                )}

                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                  {step > 1 ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-3 rounded-pill fw-semibold"
                      onClick={prevStep}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-2" />{" "}
                      Retour
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-3 rounded-pill fw-semibold shadow-sm"
                      style={{
                        background: adType
                          ? colorsByType[adType].gradient
                          : colors.oskar.green,
                        border: "none",
                      }}
                      onClick={nextStep}
                      disabled={loading || (step === 1 && !adType)}
                    >
                      Continuer{" "}
                      <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                    </button>
                  ) : (
                    <div className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary me-3"
                        onClick={onHide}
                        disabled={loading}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success px-4 py-3 rounded-pill fw-semibold shadow-sm"
                        disabled={loading || !isLoggedIn}
                        style={{
                          background: adType
                            ? colorsByType[adType].gradient
                            : "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
                          border: "none",
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />{" "}
                            Publication...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="me-2"
                            />
                            {adType === "don"
                              ? "Publier le Don"
                              : adType === "exchange"
                                ? "Proposer l'Échange"
                                : "Publier la Vente"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isLoggedIn && step > 1 && (
                  <div
                    className="alert alert-warning border-0 shadow-sm mt-4"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="d-flex align-items-center">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="fs-4 me-3"
                      />
                      <div>
                        <strong>Connexion requise</strong>
                        <div>
                          Vous devez être connecté pour publier une annonce.{" "}
                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none fw-bold"
                            onClick={onLoginRequired}
                            style={{ color: colors.oskar.green }}
                          >
                            Se connecter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .modal-content {
          border: none !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15) !important;
        }
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5) !important;
        }
        .stepper-wrapper {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .stepper-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .stepper-item::before,
        .stepper-item::after {
          position: absolute;
          content: "";
          border-bottom: 2px solid #dee2e6;
          width: 100%;
          top: 12px;
          z-index: 2;
        }
        .stepper-item::before {
          left: -50%;
        }
        .stepper-item::after {
          left: 50%;
        }
        .stepper-item:first-child::before,
        .stepper-item:last-child::after {
          content: none;
        }
        .stepper-item.completed::before,
        .stepper-item.completed::after {
          border-color: ${colors.oskar.green};
        }
        .stepper-item.active .step-counter {
          background: ${colors.oskar.green};
          color: white;
          border-color: ${colors.oskar.green};
          transform: scale(1.1);
        }
        .step-counter {
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          border: 2px solid #dee2e6;
          color: #6c757d;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .step-name {
          margin-top: 10px;
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .stepper-item.completed .step-counter {
          background: ${colors.oskar.green};
          color: white;
          border-color: ${colors.oskar.green};
        }
        .stepper-item.active .step-name {
          color: ${colors.oskar.green};
          font-weight: bold;
        }
        .stepper-item.completed .step-name {
          color: ${colors.oskar.green};
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.green} !important;
          box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.15) !important;
        }
        .card {
          borderRadius: "16px !important";
        }
        .border-dashed {
          border-style: dashed !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default PublishAdModal;