// app/(front-office)/publication-annonce/page.tsx
"use client";

import { useState, ChangeEvent, useEffect, useCallback } from "react";
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
  faExclamationTriangle,
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
  SaleMode,
  ConditionOption,
} from "./components/constantes/types";
import DonForm from "./components/DonForm";
import EchangeForm from "./components/ExchangeForm";
import VenteForm from "./components/SaleForm";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // États initiaux
  const [donData, setDonData] = useState<DonData>({
    description: "",
    type_don: "",
    localisation: "",
    lieu_retrait: "",
    image: null,
    categorie_uuid: "",
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

  const categories: Category[] = [
    {
      label: "Don & Échange",
      value: "dons-echanges",
      uuid: "6b1c309e-e2ae-44c9-bcc3-e11bdf077d1f",
      icon: faHandHoldingHeart,
    },
    {
      label: "Vêtements & Chaussures",
      value: "vetements-chaussures",
      uuid: "vetements-chaussures-uuid",
      icon: faHandHoldingHeart,
    },
    {
      label: "Électronique",
      value: "electroniques",
      uuid: "electroniques-uuid",
      icon: faHandHoldingHeart,
    },
    {
      label: "Éducation & Culture",
      value: "education-culture",
      uuid: "education-culture-uuid",
      icon: faHandHoldingHeart,
    },
    {
      label: "Services de proximité",
      value: "services-proximite",
      uuid: "services-proximite-uuid",
      icon: faHandHoldingHeart,
    },
    {
      label: "Maison & Jardin",
      value: "maison-jardin",
      uuid: "maison-jardin-uuid",
      icon: faHandHoldingHeart,
    },
    {
      label: "Véhicules",
      value: "vehicules",
      uuid: "vehicules-uuid",
      icon: faHandHoldingHeart,
    },
    {
      label: "Emploi & Services",
      value: "emploi-services",
      uuid: "emploi-services-uuid",
      icon: faHandHoldingHeart,
    },
  ];

  const conditions: ConditionOption[] = [
    { value: "neuf", label: "Neuf (jamais utilisé)" },
    { value: "tresbon", label: "Très bon état" },
    { value: "bon", label: "Bon état" },
    { value: "moyen", label: "État moyen" },
    { value: "areparer", label: "À réparer" },
  ];

  // Fonction pour parser les erreurs de l'API
  const parseApiError = (error: any) => {
    console.log("🔍 Parsing error:", error);

    // Erreur de boutique non autorisée
    if (
      error.message?.includes("Boutique non trouvée") ||
      error.message?.includes("boutique non autorisée")
    ) {
      return {
        type: "boutique",
        message:
          "❌ Cette boutique ne vous appartient pas, vous n'êtes pas autorisé à y ajouter des produits",
      };
    }

    // Erreur de catégorie obligatoire
    if (
      error.message?.includes("catégorie est obligatoire") ||
      error.message?.includes("categorie_uuid")
    ) {
      return {
        type: "categorie",
        message:
          "⚠️ La catégorie est obligatoire. Veuillez sélectionner une catégorie pour votre annonce.",
      };
    }

    // Erreur de champ obligatoire
    if (error.message?.includes("obligatoire")) {
      return {
        type: "generic",
        message: error.message,
      };
    }

    return {
      type: "generic",
      message: error.message || "Une erreur est survenue. Veuillez réessayer.",
    };
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const submitDon = async (): Promise<void> => {
    const formData = new FormData();
    formData.append("nom", donData.titre.trim());
    formData.append("type_don", donData.type_don.trim());
    formData.append("localisation", donData.localisation.trim());
    formData.append("description", donData.description.trim());
    formData.append("lieu_retrait", donData.lieu_retrait.trim());
    formData.append("categorie_uuid", donData.categorie_uuid);
    formData.append("quantite", donData.quantite);
    formData.append("numero", donData.numero.trim());
    formData.append("nom_donataire", donData.nom_donataire.trim());
    formData.append("condition", donData.condition);
    formData.append("disponibilite", donData.disponibilite);
    if (donData.image) formData.append("image", donData.image);

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
    formData.append("prix", echangeData.prix);
    formData.append("categorie_uuid", echangeData.categorie_uuid);
    formData.append("quantite", echangeData.quantite);
    formData.append("type_destinataire", echangeData.type_destinataire);
    if (echangeData.image) formData.append("image", echangeData.image);

    await sendFormData(formData, API_ENDPOINTS.ECHANGES.CREATE, "échange");
  };

  const submitVente = async (): Promise<void> => {
    console.log("🚀 Début submitVente", venteData);

    const formData = new FormData();

    // Si c'est une nouvelle boutique, on envoie le nom, sinon l'UUID
    if (venteData.boutiqueUuid === "new" && venteData.boutiqueNom) {
      formData.append("boutiqueNom", venteData.boutiqueNom);
    } else if (venteData.boutiqueUuid) {
      formData.append("boutiqueUuid", venteData.boutiqueUuid);
    }

    formData.append("libelle", venteData.libelle.trim());
    formData.append("type", venteData.type.trim());
    formData.append("disponible", String(venteData.disponible));
    formData.append("categorie_uuid", venteData.categorie_uuid);
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
    setFieldErrors({});

    try {
      console.log(`📤 Envoi ${type} vers:`, endpoint);

      const result = await api.post(endpoint, formData);
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

      // Parser l'erreur
      const parsedError = parseApiError(err);

      // Si c'est une erreur de catégorie, on peut la passer au formulaire
      if (parsedError.type === "categorie") {
        setFieldErrors({ categorie: parsedError.message });
      }

      setSubmitError(parsedError.message);
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

    // Validation basique avant envoi
    if (adType === "sale" && !venteData.categorie_uuid) {
      setSubmitError(
        "⚠️ La catégorie est obligatoire. Veuillez sélectionner une catégorie pour votre annonce.",
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
    setFieldErrors({});
  };

  const nextStep = () => step < 3 && setStep(step + 1);
  const prevStep = () => step > 1 && setStep(step - 1);
  const selectAdType = (type: "don" | "exchange" | "sale") => {
    setAdType(type);
    setStep(2);
    setSubmitError(null);
    setFieldErrors({});
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
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
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
                  <div
                    className="alert alert-danger border-0 mb-3 d-flex align-items-start shadow-sm"
                    style={{
                      borderRadius: "10px",
                      background: "#fff2f0",
                      borderLeft: "4px solid #dc3545",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="me-3 mt-1"
                      style={{ color: "#dc3545", fontSize: "1.2rem" }}
                    />
                    <div>
                      <strong
                        className="d-block mb-1"
                        style={{ color: "#58151c" }}
                      >
                        Erreur
                      </strong>
                      <p className="mb-0" style={{ color: "#842029" }}>
                        {submitError}
                      </p>
                    </div>
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
                    categories={categories}
                    conditions={conditions}
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
                    user={user}
                    saleMode={saleMode}
                    validationErrors={fieldErrors}
                    // Les props boutiques, selectedBoutique, onBoutiqueChange sont optionnelles maintenant
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

        /* Styles pour les erreurs de validation */
        .is-invalid {
          border-color: #dc3545 !important;
        }
        .is-invalid:focus {
          box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25) !important;
        }
        .invalid-feedback {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }
      `}</style>
    </>
  );
};

export default PublishAdModal;
