"use client";

import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faEdit,
  faSave,
  faSpinner,
  faImage,
  faTag,
  faFileAlt,
  faUpload,
  faCheckCircle,
  faExclamationTriangle,
  faTrash,
  faUndo,
  faLock,
  faSync,
  faEye,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";

interface Category {
  id: number;
  uuid: string;
  type: string;
  libelle: string;
  slug: string;
  description?: string;
  image: string;
  statut?: string;
  is_deleted: boolean;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  type: string;
  libelle: string;
  description: string;
  imageFile?: File | null;
}

interface ValidationErrors {
  type?: string;
  libelle?: string;
  description?: string;
  image?: string;
}

// Types de catégories
const CATEGORY_TYPES = [
  "Alimentation & Boissons",
  "Don & Échange",
  "Électronique",
  "Mode & Accessoires",
  "Maison & Jardin",
  "Automobile",
  "Services",
  "Immobilier",
  "Loisirs & Sport",
  "Santé & Beauté",
  "Éducation",
  "Autre",
];

// Image de secours encodée en base64 (alternative à un fichier manquant)
const FALLBACK_IMAGE_SRC = `data:image/svg+xml;base64,${btoa(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <rect width="100%" height="100%" fill="${colors.oskar.lightGrey}"/>
    <rect x="80" y="60" width="240" height="180" rx="10" fill="white" stroke="${colors.oskar.orange}" stroke-width="2"/>
    <circle cx="200" cy="150" r="50" fill="${colors.oskar.blue}20"/>
    <path d="M200,120 L220,170 L180,170 Z" fill="${colors.oskar.orange}"/>
    <text x="200" y="240" text-anchor="middle" font-family="Arial" font-size="16" fill="${colors.oskar.grey}">
      Image de catégorie
    </text>
    <text x="200" y="260" text-anchor="middle" font-family="Arial" font-size="12" fill="${colors.oskar.grey}">
      Format: JPG, PNG, WEBP, GIF, SVG
    </text>
  </svg>`,
)}`;

export default function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  // États
  const [formData, setFormData] = useState<FormData>({
    type: "",
    libelle: "",
    description: "",
    imageFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Vérifier l'authentification
  useEffect(() => {
    if (isOpen) {
      const token = api.getToken();
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

      console.log("🔐 Vérification auth édition:", {
        authenticated,
        tokenPresent: !!token,
        categoryId: category?.id,
        categoryName: category?.libelle,
      });

      if (!authenticated) {
        setError("Vous devez être connecté pour modifier une catégorie.");
        setTimeout(() => {
          window.location.href =
            "/login?redirect=" + encodeURIComponent(window.location.pathname);
        }, 2000);
      }
    }
  }, [isOpen, category]);

  // Fonction pour corriger l'URL de l'image (gestion CORS et proxy)
  const getSafeImageUrl = (url: string | null): string => {
    if (!url) return FALLBACK_IMAGE_SRC;

    // Si c'est une URL blob (aperçu local)
    if (url.startsWith("blob:")) {
      return url;
    }

    // Si c'est une URL distante
    try {
      const urlObj = new URL(url);

      // Si l'URL utilise le proxy local
      if (url.includes("/api/proxy/")) {
        return url;
      }

      // Si c'est une URL distante avec CORS potentiel
      // Utiliser le proxy pour contourner les problèmes CORS
      if (urlObj.hostname !== window.location.hostname) {
        console.log("🌐 Image distante détectée, utilisation du proxy:", url);

        // Créer une URL proxy
        const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}&type=category`;

        // Vérifier si le proxy est configuré
        const useProxy = process.env.NEXT_PUBLIC_USE_PROXY === "true";
        if (useProxy) {
          return proxyUrl;
        }

        // Si pas de proxy, ajouter un timestamp pour éviter le cache
        return `${url}?timestamp=${Date.now()}&nocache=true`;
      }

      // URL locale, ajouter un timestamp pour éviter le cache
      return `${url}?timestamp=${Date.now()}`;
    } catch (err) {
      console.warn("⚠️ URL d'image invalide:", url, err);
      return FALLBACK_IMAGE_SRC;
    }
  };

  // Initialiser avec les données de la catégorie
  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        type: category.type || "",
        libelle: category.libelle || "",
        description: category.description || "",
        imageFile: null,
      });

      // Utiliser l'URL sécurisée pour l'image
      const safeImageUrl = getSafeImageUrl(category.image);
      setPreviewImage(safeImageUrl);
      setOriginalImage(safeImageUrl);
      setImageLoadError(false);

      setHasChanges(false);
      setError(null);
      setSuccessMessage(null);
      setValidationErrors({});
    }
  }, [category, isOpen]);

  // Vérifier les changements
  useEffect(() => {
    if (category) {
      const original = {
        type: category.type || "",
        libelle: category.libelle || "",
        description: category.description || "",
      };

      const current = {
        type: formData.type,
        libelle: formData.libelle,
        description: formData.description,
      };

      const hasFormChanges =
        JSON.stringify(original) !== JSON.stringify(current);
      const hasImageChanges = formData.imageFile !== null;
      const hasPreviewChanges =
        previewImage !== originalImage && !previewImage?.startsWith("blob:");

      setHasChanges(hasFormChanges || hasImageChanges || hasPreviewChanges);
    }
  }, [formData, category, previewImage, originalImage]);

  // Gestion des erreurs de chargement d'image
  const handleImageError = () => {
    console.warn(
      "⚠️ Erreur de chargement d'image, utilisation de l'image de secours",
    );
    setImageLoadError(true);
    setPreviewImage(FALLBACK_IMAGE_SRC);
  };

  // Gestion du chargement d'image
  const handleImageLoad = () => {
    setImageLoadError(false);
    setImageLoading(false);
  };

  // Nettoyer les URLs d'aperçu
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.type.trim()) {
      errors.type = "Le type est obligatoire";
    }

    if (!formData.libelle.trim()) {
      errors.libelle = "Le libellé est obligatoire";
    } else if (formData.libelle.length < 2) {
      errors.libelle = "Le libellé doit contenir au moins 2 caractères";
    }

    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire";
    } else if (formData.description.length < 10) {
      errors.description =
        "La description doit contenir au moins 10 caractères";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  // Gestion du changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
        "image/svg",
      ];

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const isSvg = file.type === "image/svg+xml" || fileExtension === "svg";

      if (!validTypes.includes(file.type) && !isSvg) {
        setError(
          "Type de fichier non supporté. Utilisez JPG, PNG, WEBP, GIF ou SVG.",
        );
        return;
      }

      // Vérifier la taille (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("L'image est trop volumineuse. Taille maximale : 10MB.");
        return;
      }

      // Vérification supplémentaire pour SVG
      if (isSvg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const svgContent = e.target?.result as string;
          if (!svgContent.includes("<svg") || !svgContent.includes("xmlns=")) {
            setError(
              "Le fichier SVG n'est pas valide. Il doit contenir une balise SVG avec xmlns.",
            );
            return;
          }

          // Si SVG valide, procéder normalement
          processFileUpload(file);
        };
        reader.readAsText(file);
      } else {
        processFileUpload(file);
      }
    }
  };

  const processFileUpload = (file: File) => {
    // Mettre à jour l'état
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }));

    // Créer l'aperçu
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setImageLoadError(false);

    // Effacer les erreurs
    setError(null);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    console.log("📷 Fichier sélectionné:", {
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: previewUrl.substring(0, 50) + "...",
    });
  };

  // Supprimer la nouvelle image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
    }));

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    // Restaurer l'image d'origine
    const safeOriginalImage = getSafeImageUrl(category?.image || null);
    setPreviewImage(safeOriginalImage);
    setImageLoadError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    console.log("🗑️ Image supprimée, restauration de l'originale");
  };

  // Soumission de la modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Vous devez être connecté pour modifier une catégorie.");
      return;
    }

    if (!category) return;

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("📤 Début modification catégorie:", {
        uuid: category.uuid,
        nom: category.libelle,
        hasNewImage: !!formData.imageFile,
        previewDiff: previewImage !== originalImage,
      });

      // Vérifier à nouveau l'authentification
      const token = api.getToken();
      if (!token) {
        throw new Error("Authentification perdue. Veuillez vous reconnecter.");
      }

      // Créer FormData pour la modification
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type.trim());
      formDataToSend.append("libelle", formData.libelle.trim());
      formDataToSend.append("description", formData.description.trim());

      // Ajouter l'image seulement si elle a été changée
      if (formData.imageFile) {
        formDataToSend.append("image", formData.imageFile);
        console.log("📷 Nouvelle image ajoutée:", {
          name: formData.imageFile.name,
          type: formData.imageFile.type,
          size: formData.imageFile.size,
        });
      } else {
        // Si pas de nouvelle image mais l'image a été modifiée (supprimée)
        if (
          previewImage === FALLBACK_IMAGE_SRC &&
          originalImage !== FALLBACK_IMAGE_SRC
        ) {
          formDataToSend.append("remove_image", "true");
          console.log("🗑️ Demande de suppression de l'image existante");
        }
      }

      // Afficher les données pour débogage
      console.log("📝 Données FormData pour modification:");
      const entriesArray = [];
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          entriesArray.push({
            key,
            value: `[File] ${value.name} (${value.size} bytes)`,
          });
        } else {
          entriesArray.push({ key, value });
        }
      }
      console.table(entriesArray);

      // Utiliser la méthode patch
      const endpoint = API_ENDPOINTS.CATEGORIES.UPDATE(category.uuid);
      console.log("🚀 Envoi PATCH vers:", endpoint);

      // Utiliser api.request directement pour garantir FormData
      const response = await api.request(endpoint, {
        method: "PATCH",
        body: formDataToSend,
        requiresAuth: true,
        isFormData: true, // Forcer FormData
      });

      console.log("✅ Réponse API complète:", response);

      // Vérifier la réponse
      if (response && response.success !== false) {
        const successMsg =
          response.message || "Catégorie modifiée avec succès !";
        setSuccessMessage(successMsg);

        // Traitement de l'image après succès
        console.log("🔄 Traitement de l'image après modification...");

        // Récupérer la nouvelle URL d'image de la réponse
        const newImageUrl =
          response.data?.image_url || response.data?.image || category.image;

        if (formData.imageFile) {
          // Nettoyer l'ancienne URL blob si elle existe
          if (previewImage && previewImage.startsWith("blob:")) {
            URL.revokeObjectURL(previewImage);
          }

          // Utiliser l'URL sécurisée pour la nouvelle image
          const safeNewImageUrl = getSafeImageUrl(newImageUrl);
          setPreviewImage(safeNewImageUrl);
          setOriginalImage(safeNewImageUrl);

          // Réinitialiser le fichier image dans le formData
          setFormData((prev) => ({ ...prev, imageFile: null }));

          // Réinitialiser l'input file
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          console.log("🖼️ Image mise à jour:", safeNewImageUrl);
        } else if (
          previewImage === FALLBACK_IMAGE_SRC &&
          originalImage !== FALLBACK_IMAGE_SRC
        ) {
          // Si l'image a été supprimée
          setPreviewImage(FALLBACK_IMAGE_SRC);
          setOriginalImage(FALLBACK_IMAGE_SRC);
          console.log("🗑️ Image supprimée avec succès");
        }

        // Mettre à jour les données de la catégorie avec la réponse
        if (response.data) {
          console.log("📋 Données mises à jour:", {
            type: response.data.type,
            libelle: response.data.libelle,
            image: response.data.image,
          });
        }

        // Fermer la modal après succès
        setTimeout(() => {
          if (onSuccess) {
            console.log("🔄 Appel de onSuccess pour rafraîchir les données");
            onSuccess();
          }
          onClose();
        }, 1500);
      } else {
        throw new Error(
          response?.message || "La modification a échoué sans message d'erreur",
        );
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la modification:", err);

      let errorMessage =
        err.message || "Erreur lors de la modification de la catégorie";

      // Messages d'erreur spécifiques
      if (
        errorMessage.includes("Authentification") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        errorMessage = "Authentification requise. Veuillez vous reconnecter.";

        // Rediriger vers login
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href =
              "/login?redirect=" + encodeURIComponent(window.location.pathname);
          }
        }, 2000);
      } else if (
        errorMessage.includes("404") ||
        errorMessage.includes("not found")
      ) {
        errorMessage = "Catégorie non trouvée. Elle a peut-être été supprimée.";
      } else if (
        errorMessage.includes("409") ||
        errorMessage.includes("already exists")
      ) {
        errorMessage = "Une catégorie avec ce libellé existe déjà.";
      } else if (
        errorMessage.includes("Cannot PUT") ||
        errorMessage.includes("Cannot PATCH")
      ) {
        errorMessage =
          "Erreur de méthode HTTP. Vérifiez que l'endpoint API est correct.";
        console.error(
          "⚠️ Vérifiez l'endpoint:",
          API_ENDPOINTS.CATEGORIES.UPDATE(category.uuid),
        );
      } else if (errorMessage.includes("413")) {
        errorMessage =
          "Fichier trop volumineux. La taille maximale est de 10MB.";
      } else if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("blocked")
      ) {
        errorMessage =
          "Problème de chargement d'image. L'image sera rechargée après enregistrement.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer la catégorie
  const handleDelete = async () => {
    if (!category || !isAuthenticated) {
      setError("Authentification requise pour supprimer une catégorie.");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🗑️  Suppression catégorie:", category.uuid);

      const response = await api.delete(
        API_ENDPOINTS.CATEGORIES.DELETE(category.uuid),
        {
         // requiresAuth: true,
        },
      );

      console.log("✅ Catégorie supprimée:", response);

      setSuccessMessage("Catégorie supprimée avec succès !");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la suppression:", err);

      let errorMessage = "Erreur lors de la suppression de la catégorie";

      if (err.message) {
        errorMessage = err.message;
      }

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Authentification")
      ) {
        errorMessage = "Authentification requise pour supprimer une catégorie.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Restaurer la catégorie
  const handleRestore = async () => {
    if (!category || !isAuthenticated) {
      setError("Authentification requise pour restaurer une catégorie.");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir restaurer cette catégorie ?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Restauration catégorie:", category.uuid);

      // Utiliser l'endpoint de restauration
      const response = await api.post(
        `/categories/${category.uuid}/restore`,
        {},
        {
          //requiresAuth: true,
        },
      );

      console.log("✅ Catégorie restaurée:", response);

      setSuccessMessage("Catégorie restaurée avec succès !");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors de la restauration:", err);
      setError(err.message || "Erreur lors de la restauration de la catégorie");
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser les changements
  const handleReset = () => {
    if (!category) return;

    if (hasChanges) {
      if (!confirm("Voulez-vous annuler tous les changements ?")) {
        return;
      }
    }

    setFormData({
      type: category.type || "",
      libelle: category.libelle || "",
      description: category.description || "",
      imageFile: null,
    });

    // Nettoyer l'aperçu blob si nécessaire
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    // Restaurer l'image originale avec URL sécurisée
    const safeOriginalImage = getSafeImageUrl(category.image || null);
    setPreviewImage(safeOriginalImage);
    setOriginalImage(safeOriginalImage);
    setImageLoadError(false);

    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    console.log("🔄 Formulaire réinitialisé aux valeurs d'origine");
  };

  // Prévisualiser l'image dans une nouvelle fenêtre
  const handlePreviewImage = () => {
    if (previewImage && previewImage !== FALLBACK_IMAGE_SRC) {
      window.open(previewImage, "_blank");
    }
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    // Nettoyer l'aperçu blob
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    if (hasChanges) {
      if (
        !confirm(
          "Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?",
        )
      ) {
        return;
      }
    }

    onClose();
  };

  if (!isOpen || !category) return null;

  const isDeleted = category.is_deleted;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 1050,
      }}
      role="dialog"
      aria-labelledby="editCategoryModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px" }}
        >
          {/* En-tête */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={{
              background: `linear-gradient(135deg, ${colors.oskar.orange} 0%, ${colors.oskar.orange} 100%)`,
              borderBottom: `3px solid ${colors.oskar.blue}`,
            }}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faEdit} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="editCategoryModalLabel"
                >
                  Modifier la Catégorie
                  {hasChanges && (
                    <span className="badge bg-warning ms-2 fs-12">
                      Modifications non sauvegardées
                    </span>
                  )}
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  {category.libelle} • ID: {category.id}
                  {isDeleted && " • ❌ Supprimée"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>

          {/* Corps */}
          <div className="modal-body py-4">
            {/* Message d'authentification */}
            {!isAuthenticated && (
              <div
                className="alert alert-warning border-0 shadow-sm mb-4"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon icon={faLock} className="text-warning" />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">
                      Authentification requise
                    </h6>
                    <p className="mb-0">
                      Vous devez être connecté pour modifier une catégorie.
                      Redirection vers la page de connexion...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message catégorie supprimée */}
            {isDeleted && (
              <div
                className="alert alert-warning alert-dismissible fade show mb-4 border-0 shadow-sm"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-warning"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">Catégorie supprimée</h6>
                    <p className="mb-0">
                      Cette catégorie a été supprimée le{" "}
                      {category.deleted_at
                        ? new Date(category.deleted_at).toLocaleDateString(
                            "fr-FR",
                          )
                        : "N/A"}
                      . Vous devez d'abord la restaurer pour la modifier.
                    </p>
                    <button
                      type="button"
                      className="btn btn-warning btn-sm mt-2 d-flex align-items-center gap-2"
                      onClick={handleRestore}
                      disabled={loading || !isAuthenticated}
                      style={{ borderRadius: "8px" }}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      Restaurer la catégorie
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'erreur */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show mb-4 border-0 shadow-sm"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-danger"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">Erreur</h6>
                    <p className="mb-0">{error}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                    aria-label="Fermer"
                  />
                </div>
              </div>
            )}

            {/* Message de succès */}
            {successMessage && (
              <div
                className="alert alert-success alert-dismissible fade show mb-4 border-0 shadow-sm"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.green}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-success"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">Succès</h6>
                    <p className="mb-0">{successMessage}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccessMessage(null)}
                    aria-label="Fermer"
                  />
                </div>
              </div>
            )}

            {/* Indicateur de changements */}
            {hasChanges && !successMessage && (
              <div
                className="alert alert-info border-0 shadow-sm mb-4 d-flex align-items-center justify-content-between"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.blue}20` }}
                    >
                      <FontAwesomeIcon icon={faSync} className="text-info" />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">
                      Modifications détectées
                    </h6>
                    <p className="mb-0">
                      Vous avez des modifications non sauvegardées.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm"
                  onClick={handleReset}
                  disabled={loading}
                  style={{ borderRadius: "6px" }}
                >
                  <FontAwesomeIcon icon={faUndo} className="me-1" />
                  Réinitialiser
                </button>
              </div>
            )}

            {/* Avertissement CORS */}
            {imageLoadError && previewImage !== FALLBACK_IMAGE_SRC && (
              <div
                className="alert alert-warning border-0 shadow-sm mb-4"
                role="alert"
                style={{ borderRadius: "10px" }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-circle p-2"
                      style={{ backgroundColor: `${colors.oskar.orange}20` }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationCircle}
                        className="text-warning"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h6 className="alert-heading mb-1">
                      Problème de chargement d'image
                    </h6>
                    <p className="mb-0">
                      L'image n'a pas pu être chargée en raison de restrictions
                      de sécurité. Elle sera rechargée après l'enregistrement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Type */}
                <div className="col-md-12">
                  <label htmlFor="type" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Type <span className="text-danger">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className={`form-select ${validationErrors.type ? "is-invalid" : ""}`}
                    value={formData.type}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated || isDeleted}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">Sélectionner un type...</option>
                    {CATEGORY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {validationErrors.type && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.type}
                    </div>
                  )}
                </div>

                {/* Libellé */}
                <div className="col-12">
                  <label htmlFor="libelle" className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faTag} className="me-2" />
                    Libellé <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="libelle"
                    name="libelle"
                    className={`form-control ${validationErrors.libelle ? "is-invalid" : ""}`}
                    value={formData.libelle}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated || isDeleted}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.libelle && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.libelle}
                    </div>
                  )}
                  <small className="text-muted mt-1 d-block">
                    Slug actuel : <code>{category.slug}</code>
                    {formData.libelle !== category.libelle && (
                      <span className="text-warning ms-2">
                        <FontAwesomeIcon icon={faSync} className="me-1" />
                        Le slug sera régénéré
                      </span>
                    )}
                  </small>
                </div>

                {/* Description */}
                <div className="col-12">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className={`form-control ${validationErrors.description ? "is-invalid" : ""}`}
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading || !isAuthenticated || isDeleted}
                    style={{ borderRadius: "8px" }}
                  />
                  {validationErrors.description && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.description}
                    </div>
                  )}
                </div>

                {/* Image */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Image de la catégorie
                    <span className="text-muted ms-1 fw-normal">
                      (Optionnel)
                    </span>
                  </label>

                  {/* Image actuelle */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="text-muted mb-0">
                        Image actuelle{" "}
                        {previewImage !== originalImage && "(modifiée)"}:
                      </p>
                      {previewImage && previewImage !== FALLBACK_IMAGE_SRC && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={handlePreviewImage}
                          style={{ borderRadius: "6px" }}
                        >
                          <FontAwesomeIcon icon={faEye} className="fs-11" />
                          <span>Voir en grand</span>
                        </button>
                      )}
                    </div>
                    {previewImage ? (
                      <div className="position-relative d-inline-block">
                        <img
                          ref={imgRef}
                          src={previewImage}
                          alt={category.libelle}
                          className="img-fluid rounded border shadow-sm"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            objectFit: "cover",
                            backgroundColor: colors.oskar.lightGrey,
                            border: `2px solid ${
                              imageLoadError
                                ? colors.oskar.orange
                                : colors.oskar.grey + "30"
                            }`,
                          }}
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                          loading="lazy"
                          crossOrigin="anonymous"
                        />
                        {imageLoading && (
                          <div
                            className="position-absolute top-50 start-50 translate-middle"
                            style={{ zIndex: 2 }}
                          >
                            <div className="spinner-border spinner-border-sm text-primary">
                              <span className="visually-hidden">
                                Chargement...
                              </span>
                            </div>
                          </div>
                        )}
                        {previewImage !== originalImage && (
                          <span className="badge bg-warning position-absolute top-0 start-0 m-1">
                            Modifié
                          </span>
                        )}
                        {imageLoadError && (
                          <span className="badge bg-danger position-absolute top-0 end-0 m-1">
                            Erreur
                          </span>
                        )}
                        {previewImage === FALLBACK_IMAGE_SRC && (
                          <span className="badge bg-info position-absolute top-0 start-0 m-1">
                            Par défaut
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-muted">
                        <FontAwesomeIcon icon={faImage} className="me-2" />
                        Aucune image
                      </div>
                    )}
                  </div>

                  {/* Nouvelle image (si upload) */}
                  {previewImage &&
                    previewImage !== originalImage &&
                    previewImage.startsWith("blob:") && (
                      <div className="mb-3">
                        <p className="text-muted mb-2">
                          Nouvelle image (aperçu):
                        </p>
                        <div className="position-relative d-inline-block">
                          <img
                            src={previewImage}
                            alt="Nouvelle image"
                            className="img-fluid rounded border shadow-sm"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onClick={handleRemoveImage}
                            disabled={loading || !isAuthenticated || isDeleted}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              padding: "0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Annuler le changement d'image"
                          >
                            <FontAwesomeIcon icon={faTimes} className="fs-10" />
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Upload */}
                  <div className="input-group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="imageFile"
                      name="imageFile"
                      className="form-control"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={handleFileChange}
                      disabled={loading || !isAuthenticated || isDeleted}
                      style={{ borderRadius: "8px 0 0 8px" }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary d-flex align-items-center"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || !isAuthenticated || isDeleted}
                      style={{ borderRadius: "0 8px 8px 0" }}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span className="ms-2">
                        {previewImage && previewImage !== originalImage
                          ? "Changer"
                          : "Modifier l'image"}
                      </span>
                    </button>
                  </div>

                  <div className="text-muted mt-2">
                    <small>
                      Formats acceptés: JPG, PNG, WEBP, GIF, SVG (max 10MB).
                      Laisser vide pour conserver l'image actuelle.
                    </small>
                  </div>
                </div>

                {/* Informations */}
                <div className="col-12">
                  <div className="card border-0 bg-light-subtle">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3">
                        Informations de la catégorie
                      </h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>ID :</strong> {category.id}
                          </p>
                          <p className="mb-2">
                            <strong>UUID :</strong>{" "}
                            <code className="text-muted">{category.uuid}</code>
                          </p>
                          <p className="mb-2">
                            <strong>Créée le :</strong>{" "}
                            {category.createdAt
                              ? new Date(category.createdAt).toLocaleDateString(
                                  "fr-FR",
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p className="mb-2">
                            <strong>Modifiée le :</strong>{" "}
                            {category.updatedAt
                              ? new Date(category.updatedAt).toLocaleDateString(
                                  "fr-FR",
                                )
                              : "N/A"}
                          </p>
                          <p className="mb-2">
                            <strong>Slug :</strong>{" "}
                            <code className="text-muted">{category.slug}</code>
                          </p>
                          <p className="mb-2">
                            <strong>Statut :</strong>{" "}
                            <span
                              className={`badge ${
                                category.statut === "actif" ||
                                category.statut === "1" ||
                                !category.statut
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {category.statut === "actif" ||
                              category.statut === "1" ||
                              !category.statut
                                ? "Actif"
                                : "Inactif"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Pied de page */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <div className="d-flex gap-2">
                {!isDeleted && isAuthenticated && (
                  <button
                    type="button"
                    className="btn btn-outline-danger d-flex align-items-center gap-2"
                    onClick={handleDelete}
                    disabled={loading || !isAuthenticated}
                    style={{ borderRadius: "8px" }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Supprimer
                  </button>
                )}
                {hasChanges && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={handleReset}
                    disabled={loading}
                    style={{ borderRadius: "8px" }}
                  >
                    <FontAwesomeIcon icon={faUndo} />
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    background: colors.oskar.lightGrey,
                    color: colors.oskar.grey,
                    border: `1px solid ${colors.oskar.grey}30`,
                    borderRadius: "8px",
                    fontWeight: "500",
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn text-white d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={
                    loading || !isAuthenticated || isDeleted || !hasChanges
                  }
                  style={{
                    background:
                      hasChanges && !isDeleted
                        ? colors.oskar.orange
                        : colors.oskar.grey,
                    border: `1px solid ${hasChanges && !isDeleted ? colors.oskar.orange : colors.oskar.grey}`,
                    borderRadius: "8px",
                    fontWeight: "500",
                    opacity: !hasChanges || isDeleted ? 0.6 : 1,
                    cursor:
                      !hasChanges || isDeleted ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Enregistrement...
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <FontAwesomeIcon icon={faLock} />
                      Connectez-vous
                    </>
                  ) : isDeleted ? (
                    <>
                      <FontAwesomeIcon icon={faUndo} />
                      Restaurer d'abord
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-control,
        .form-select {
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.orange};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.orange}25;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .fs-12 {
          font-size: 12px !important;
        }

        .fs-11 {
          font-size: 11px !important;
        }

        .fs-10 {
          font-size: 10px !important;
        }

        .img-fluid {
          max-width: 100%;
          height: auto;
        }

        code {
          font-size: 0.875em;
          background-color: ${colors.oskar.lightGrey};
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: "Courier New", monospace;
        }

        .badge {
          font-weight: 500;
          font-size: 0.7em;
          padding: 0.3em 0.6em;
        }

        .spinner-border {
          width: 1.5rem;
          height: 1.5rem;
        }

        .input-group {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .alert {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
