"use client";

import { useState, ChangeEvent, useEffect } from "react";
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
} from "./components/constantes/types";
import DonForm from "./components/DonForm";
import EchangeForm from "./components/ExchangeForm";
import VenteForm from "./components/SaleForm";
import CreateBoutiqueModal from "@/app/(back-office)/dashboard-vendeur/boutique/apercu/components/modals/CreateBoutiqueModal";
import VendeurRegisterModal from "@/app/(front-office)/auth/register/VendeurRegisterModal";

const PublishAdModal: React.FC<PublishAdModalProps> = ({
  visible,
  onHide,
  isLoggedIn,
  onLoginRequired,
  user,
}) => {
  const [adType, setAdType] = useState<"don" | "exchange" | "sale" | null>(
    null,
  );
  const [saleMode, setSaleMode] = useState<SaleMode>("particulier");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour la création de boutique
  const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
  const [loadingBoutique, setLoadingBoutique] = useState(false);
  const [boutiqueCreationSuccess, setBoutiqueCreationSuccess] = useState(false);
  const [pendingVenteData, setPendingVenteData] = useState<VenteData | null>(null);
  const [createdBoutiqueUuid, setCreatedBoutiqueUuid] = useState<string | null>(null);
  const [createdBoutiqueNom, setCreatedBoutiqueNom] = useState<string | null>(null);

  // État pour le modal d'inscription vendeur
  const [showVendeurRegisterModal, setShowVendeurRegisterModal] = useState(false);

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
  const [selectedBoutique, setSelectedBoutique] = useState<Boutique | null>(
    null,
  );

  const adTypeOptions: AdTypeOption[] = [
    {
      id: "don",
      title: "Faire un Don",
      description: "Offrez gratuitement à votre communauté",
      icon: faHandHoldingHeart,
      color: "warning",
      gradient: "linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)",
      iconBg: "#fff4e6",
    },
    {
      id: "exchange",
      title: "Proposer un Échange",
      description: "Trouvez ce dont vous avez besoin",
      icon: faArrowsRotate,
      color: "primary",
      gradient: "linear-gradient(135deg, #007aff 0%, #5856d6 100%)",
      iconBg: "#e6f2ff",
    },
    {
      id: "sale",
      title: "Vendre un Produit",
      description: "Gagnez de l'argent localement",
      icon: faSaleTag,
      color: "success",
      gradient: "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
      iconBg: "#e6f7ec",
    },
  ];

  // ✅ CORRECTION: Ajout des propriétés manquantes à Category
  const categories: Category[] = [
    {
      uuid: "6b1c309e-e2ae-44c9-bcc3-e11bdf077d1f",
      libelle: "Don & Échange",
      path: "/dons-echanges",
      label: "Don & Échange",
      value: "dons-echanges",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "vetements-chaussures-uuid",
      libelle: "Vêtements & Chaussures",
      path: "/vetements-chaussures",
      label: "Vêtements & Chaussures",
      value: "vetements-chaussures",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "electroniques-uuid",
      libelle: "Électronique",
      path: "/electroniques",
      label: "Électronique",
      value: "electroniques",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "education-culture-uuid",
      libelle: "Éducation & Culture",
      path: "/education-culture",
      label: "Éducation & Culture",
      value: "education-culture",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "services-proximite-uuid",
      libelle: "Services de proximité",
      path: "/services-proximite",
      label: "Services de proximité",
      value: "services-proximite",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "maison-jardin-uuid",
      libelle: "Maison & Jardin",
      path: "/maison-jardin",
      label: "Maison & Jardin",
      value: "maison-jardin",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "vehicules-uuid",
      libelle: "Véhicules",
      path: "/vehicules",
      label: "Véhicules",
      value: "vehicules",
      icon: faHandHoldingHeart,
    },
    {
      uuid: "emploi-services-uuid",
      libelle: "Emploi & Services",
      path: "/emploi-services",
      label: "Emploi & Services",
      value: "emploi-services",
      icon: faHandHoldingHeart,
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

  // Vérifier si l'utilisateur est un vendeur
  const isVendeur = user?.type?.toLowerCase() === "vendeur";

  // Charger les boutiques seulement si c'est un vendeur
  useEffect(() => {
    const fetchBoutiques = async () => {
      if (!isLoggedIn || adType !== "sale" || !isVendeur) {
        setBoutiques([]);
        return;
      }

      try {
        const token = localStorage.getItem("oskar_token");
        if (!token) return;

        const url = API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR;
        console.log("🛍️ Chargement des boutiques:", url);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`);
        }

        const data = await response.json();
        let boutiquesData: Boutique[] = [];

        if (Array.isArray(data)) {
          boutiquesData = data;
        } else if (data && Array.isArray(data.data)) {
          boutiquesData = data.data;
        } else if (data && data.data && Array.isArray(data.data.data)) {
          boutiquesData = data.data.data;
        } else if (data && data.success && Array.isArray(data.data)) {
          boutiquesData = data.data;
        }

        const boutiquesActives = boutiquesData.filter(
          (boutique) =>
            !boutique.est_bloque &&
            !boutique.est_ferme &&
            (boutique.statut === "actif" || boutique.statut === "en_review"),
        );

        console.log(`📊 ${boutiquesActives.length} boutique(s) active(s)`);
        setBoutiques(boutiquesActives);

        if (createdBoutiqueUuid && createdBoutiqueNom) {
          handleBoutiqueChange(createdBoutiqueUuid, createdBoutiqueNom);
          setCreatedBoutiqueUuid(null);
          setCreatedBoutiqueNom(null);
        }
        else if (boutiquesActives.length > 0 && !venteData.boutiqueUuid) {
          const premiereBoutique = boutiquesActives[0];
          handleBoutiqueChange(premiereBoutique.uuid, premiereBoutique.nom);
          console.log(`✅ Boutique présélectionnée: ${premiereBoutique.nom}`);
        }
      } catch (err) {
        console.error("❌ Erreur chargement boutiques:", err);
        setBoutiques([]);
      }
    };

    if (visible && isLoggedIn && adType === "sale" && isVendeur) {
      fetchBoutiques();
    }
  }, [visible, isLoggedIn, adType, isVendeur, venteData.boutiqueUuid, createdBoutiqueUuid, createdBoutiqueNom]);

  // Mettre à jour selectedBoutique quand boutiqueUuid change
  useEffect(() => {
    if (venteData.boutiqueUuid && boutiques.length > 0) {
      const boutique = boutiques.find((b) => b.uuid === venteData.boutiqueUuid);
      setSelectedBoutique(boutique || null);
    } else {
      setSelectedBoutique(null);
    }
  }, [venteData.boutiqueUuid, boutiques]);

  // Réinitialiser quand le type d'annonce change
  useEffect(() => {
    if (adType !== "sale") {
      setShowBoutiqueModal(false);
      setPendingVenteData(null);
    }
  }, [adType]);

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
          break;
        case "exchange":
          setEchangeData({ ...echangeData, image: file });
          break;
        case "sale":
          setVenteData({ ...venteData, image: file });
          break;
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
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

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
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

  const checkBoutiqueBeforeProceed = () => {
    if (adType === "sale" && isVendeur && boutiques.length === 0) {
      setPendingVenteData({ ...venteData });
      setShowBoutiqueModal(true);
      return true;
    }
    return false;
  };

  const nextStep = () => {
    if (step === 2 && checkBoutiqueBeforeProceed()) {
      return;
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
      const token = localStorage.getItem("oskar_token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await fetch(API_ENDPOINTS.BOUTIQUES.CREATE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la création");
      }

      const data = await response.json();
      console.log("✅ Boutique créée:", data);

      const newBoutiqueUuid = data.boutique?.uuid || data.uuid;
      const newBoutiqueNom = data.boutique?.nom || formData.get("nom") as string;

      setCreatedBoutiqueUuid(newBoutiqueUuid);
      setCreatedBoutiqueNom(newBoutiqueNom);
      
      setTimeout(() => {
        const fetchUpdatedBoutiques = async () => {
          const token = localStorage.getItem("oskar_token");
          if (!token) return;

          const response = await fetch(API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            let boutiquesData: Boutique[] = [];
            if (Array.isArray(data)) {
              boutiquesData = data;
            } else if (data && Array.isArray(data.data)) {
              boutiquesData = data.data;
            }
            setBoutiques(boutiquesData);
          }
        };
        fetchUpdatedBoutiques();
      }, 500);

      setShowBoutiqueModal(false);
      setBoutiqueCreationSuccess(true);

      if (pendingVenteData) {
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
      setSubmitError(error.message);
    } finally {
      setLoadingBoutique(false);
    }
  };

  const submitDon = async (): Promise<void> => {
    const formData = new FormData();

    formData.append("type_don", donData.type_don.trim());
    formData.append("nom", donData.titre.trim());
    formData.append("localisation", donData.localisation.trim());
    formData.append("description", donData.description.trim());
    formData.append("lieu_retrait", donData.lieu_retrait.trim());
    formData.append("categorie_uuid", donData.categorie_uuid);
    formData.append("sous_categorie_uuid", donData.sous_categorie_uuid);
    formData.append("quantite", donData.quantite);
    formData.append("numero", donData.numero.trim());
    formData.append("nom_donataire", donData.nom_donataire.trim());

    if (donData.condition) {
      formData.append("condition", donData.condition);
    }

    if (donData.disponibilite) {
      formData.append("disponibilite", donData.disponibilite);
    }

    if (donData.image) {
      formData.append("image", donData.image);
    }

    await sendFormData(formData, API_ENDPOINTS.DONS.CREATE, "don");
  };

  const submitEchange = async (): Promise<void> => {
    const formData = new FormData();

    formData.append("nomElementEchange", echangeData.nomElementEchange.trim());
    formData.append("numero", echangeData.numero.trim());
    formData.append("nom_initiateur", echangeData.nom_initiateur);
    formData.append("typeEchange", echangeData.typeEchange);
    formData.append("objetPropose", echangeData.objetPropose.trim());
    formData.append("objetDemande", echangeData.objetDemande.trim());
    formData.append("message", echangeData.message.trim());
    formData.append("categorie_uuid", echangeData.categorie_uuid);
    formData.append("sous_categorie_uuid", echangeData.sous_categorie_uuid);
    formData.append("quantite", echangeData.quantite);
    formData.append("type_destinataire", echangeData.type_destinataire);

    if (echangeData.prix) {
      formData.append("prix", echangeData.prix);
    }

    if (echangeData.image) {
      formData.append("image", echangeData.image);
    }

    await sendFormData(formData, API_ENDPOINTS.ECHANGES.CREATE, "échange");
  };

  const submitVente = async (): Promise<void> => {
    console.log("🚀 Début submitVente");
    console.log("📊 État venteData:", venteData);
    console.log("👤 Type utilisateur:", user?.type);

    const formData = new FormData();

    const boutiqueId = venteData.boutiqueUuid;
    console.log("📝 boutiqueUuid à envoyer:", boutiqueId);

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
    formData.append("categorie_uuid", venteData.categorie_uuid);
    formData.append("sous_categorie_uuid", venteData.sous_categorie_uuid);
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

    await sendFormData(formData, API_ENDPOINTS.PRODUCTS.CREATE, "vente");
  };

  const sendFormData = async (
    formData: FormData,
    endpoint: string,
    type: "don" | "échange" | "vente",
  ) => {
    setLoading(true);
    setSubmitError(null);

    try {
      console.log(`📤 Envoi ${type} vers:`, endpoint);

      const token = localStorage.getItem("oskar_token");

      if (!token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log("📥 Statut réponse:", response.status);

      if (!response.ok) {
        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("❌ Détails de l'erreur:", errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Ignorer
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`✅ ${type} créé avec succès:`, result);

      resetForm();
      showSuccessNotification(
        `Votre ${
          type === "don"
            ? "don"
            : type === "échange"
              ? "échange"
              : "annonce de vente"
        } a été publié(e) avec succès !`,
      );

      setTimeout(() => {
        onHide();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error(`❌ Erreur publication ${type}:`, err);

      let errorMessage = err.message;

      if (
        errorMessage.includes("boutiqueUuid") ||
        errorMessage.includes("boutique_uuid")
      ) {
        errorMessage =
          "Veuillez sélectionner une boutique pour vendre ce produit";
      } else if (errorMessage.includes("400")) {
        errorMessage = "Veuillez vérifier les informations du formulaire";
      } else if (errorMessage.includes("401")) {
        errorMessage = "Session expirée. Veuillez vous reconnecter";
      } else if (errorMessage.includes("vendeur")) {
        errorMessage = "Les vendeurs doivent vendre via une boutique";
      } else if (
        errorMessage.includes("type_don") ||
        errorMessage.includes("localisation")
      ) {
        errorMessage =
          "Les champs 'Type de don' et 'Localisation' sont obligatoires";
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    if (adType === "sale" && isVendeur && !venteData.boutiqueUuid) {
      setSubmitError(
        "Veuillez sélectionner une boutique pour vendre ce produit",
      );
      return;
    }

    if (adType === "don") {
      if (!donData.type_don?.trim()) {
        setSubmitError("Le champ 'Type de don' est obligatoire");
        return;
      }
      if (!donData.localisation?.trim()) {
        setSubmitError("Le champ 'Localisation' est obligatoire");
        return;
      }
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
      // Erreur déjà gérée
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
  };

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
        {adTypeOptions.map((option) => (
          <div key={option.id} className="col-md-4">
            <div
              className={`card h-100 border-0 shadow-lg-hover cursor-pointer ${
                adType === option.id ? "border-3 border-" + option.color : ""
              }`}
              onClick={() => selectAdType(option.id)}
              style={{
                minHeight: "280px",
                borderRadius: "20px",
                background: adType === option.id ? option.gradient : "white",
              }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-4">
                <div
                  className="rounded-circle p-4 mb-4"
                  style={{
                    background: adType === option.id ? "white" : option.iconBg,
                    transform: adType === option.id ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={option.icon}
                    className={`fs-1 ${
                      adType === option.id
                        ? "text-" + option.color
                        : "text-" + option.color
                    }`}
                  />
                </div>
                <h4
                  className={`fw-bold mb-3 ${
                    adType === option.id ? "text-white" : "text-dark"
                  }`}
                >
                  {option.title}
                </h4>
                <p
                  className={`mb-4 ${
                    adType === option.id
                      ? "text-white text-opacity-90"
                      : "text-muted"
                  }`}
                >
                  {option.description}
                </p>
                <div
                  className={`rounded-circle border-2 d-flex align-items-center justify-content-center ${
                    adType === option.id ? "border-white" : "border-light"
                  }`}
                  style={{ width: "28px", height: "28px" }}
                >
                  {adType === option.id && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!visible) return null;

  return (
    <>
      {/* Notification de succès */}
      {successMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 9999, maxWidth: "600px", width: "90%" }}
        >
          <div
            className="alert alert-success border-0 shadow-lg d-flex align-items-center justify-content-between"
            role="alert"
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
              color: "white",
              padding: "1rem 1.5rem",
            }}
          >
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-white bg-opacity-25 p-2 me-3">
                <FontAwesomeIcon icon={faCheckCircle} className="fs-4" />
              </div>
              <div>
                <h5 className="fw-bold mb-1">Succès !</h5>
                <p className="mb-0 opacity-90">{successMessage}</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white opacity-75"
              onClick={() => setSuccessMessage(null)}
              aria-label="Close"
              style={{ background: "transparent", border: "none" }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
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

      {boutiqueCreationSuccess && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 9999, maxWidth: "600px", width: "90%" }}
        >
          <div
            className="alert alert-info border-0 shadow-lg d-flex align-items-center"
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
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
                background: adType
                  ? adType === "don"
                    ? "linear-gradient(135deg, #fff4e6 0%, #ffffff 100%)"
                    : adType === "exchange"
                      ? "linear-gradient(135deg, #e6f2ff 0%, #ffffff 100%)"
                      : "linear-gradient(135deg, #e6f7ec 0%, #ffffff 100%)"
                  : "white",
              }}
            >
              <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="modal-title fw-bold text-dark mb-1">
                      {step === 1
                        ? "Publier une annonce"
                        : adType === "don"
                          ? "Faire un Don"
                          : adType === "exchange"
                            ? "Proposer un Échange"
                            : "Vendre un Produit"}
                    </h2>
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
    categories={categories} // ✅ AJOUT
    sous_categorie_uuid={donData.sous_categorie_uuid} // ✅ AJOUT
    imagePreview={imagePreview}
    onChange={setDonData}
    onImageUpload={handleImageUpload}
    onRemoveImage={removeImage}
    step={step}
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
    saleMode={saleMode} // ✅ MAINTENANT VALIDE
    onOpenCreateBoutique={handleOpenCreateBoutique}
    onOpenVendeurRegister={handleOpenVendeurRegister}
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
                          ? adType === "don"
                            ? "linear-gradient(135deg, #ff9500 0%, #ff5e3a 100%)"
                            : adType === "exchange"
                              ? "linear-gradient(135deg, #007aff 0%, #5856d6 100%)"
                              : "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)"
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
                          background:
                            "linear-gradient(135deg, #34c759 0%, #30b0c7 100%)",
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
          border-radius: 16px !important;
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </>
  );
};

export default PublishAdModal;