// app/(back-office)/dashboard-vendeur/profile/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import { buildImageUrl } from "@/app/shared/utils/image-utils";
import colors from "@/app/shared/constants/colors";

interface ProfileData {
  uuid?: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string | null;
  date_naissance: string | null;
  avatar: string | null;
  photo?: string | null;
  registre_commerce?: string | null;
  type?: "standard" | "premium";
  is_verified?: boolean;
  created_at?: string;
}

interface Civilité {
  uuid: string;
  libelle: string;
}

interface RegistreCommerce {
  url: string;
  key: string;
  original_name: string;
  size: number;
  mimetype: string;
  uploaded_at?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: RegistreCommerce;
}

export default function ProfileVendeurPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingRegistre, setUploadingRegistre] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [civilites, setCivilites] = useState<Civilité[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "registre">(
    "personal",
  );
  const [formData, setFormData] = useState<ProfileData>({
    nom: "",
    prenoms: "",
    email: "",
    telephone: null,
    date_naissance: null,
    avatar: null,
    photo: null,
    registre_commerce: null,
    type: "standard",
    is_verified: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  
  // États pour le registre de commerce
  const [currentRegistre, setCurrentRegistre] = useState<RegistreCommerce | null>(null);
  const [registreHistory, setRegistreHistory] = useState<RegistreCommerce[]>([]);
  const [selectedRegistreFile, setSelectedRegistreFile] = useState<File | null>(null);
  const [registrePreviewUrl, setRegistrePreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Récupérer les civilités
  useEffect(() => {
    const fetchCivilites = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.CIVILITES.ACTIVES);
        setCivilites(response.data?.data || response.data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des civilités:", err);
      }
    };
    fetchCivilites();
  }, []);

  // ✅ FONCTION CORRIGÉE: Récupérer l'URL de l'avatar (comme dans l'admin)
  const getAvatarUrl = useCallback(() => {
    if (!profile) return getDefaultAvatar();

    if (avatarError) {
      return getDefaultAvatar();
    }

    // Essayer d'abord avec avatar (c'est le champ principal comme dans l'admin)
    if (formData.avatar) {
      console.log("🖼️ Avatar trouvé:", formData.avatar);
      const url = buildImageUrl(formData.avatar);
      console.log("🖼️ URL construite:", url);
      if (url) return url;
    }

    // Essayer avec photo (fallback)
    if (formData.photo) {
      console.log("🖼️ Photo trouvée:", formData.photo);
      const url = buildImageUrl(formData.photo);
      console.log("🖼️ URL construite depuis photo:", url);
      if (url) return url;
    }

    console.log("🖼️ Aucune image trouvée, retour default");
    return getDefaultAvatar();
  }, [profile, formData.avatar, formData.photo, avatarError]);

  // ✅ Avatar par défaut (comme dans l'admin)
  const getDefaultAvatar = useCallback(() => {
    const firstName = formData.prenoms?.charAt(0) || "";
    const lastName = formData.nom?.charAt(0) || "";
    const initials = `${firstName}${lastName}`.toUpperCase() || "V";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=150&bold=true`;
  }, [formData.prenoms, formData.nom]);

  // ✅ Gestionnaire d'erreur d'image (comme dans l'admin)
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      console.log("❌ Erreur de chargement d'image:", target.src);

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

      if (target.src.includes("%20")) {
        target.src = target.src.replace(/%20/g, "");
        return;
      }

      if (target.src.includes("%2F") && !target.src.includes("/api/files/")) {
        const pathMatch = target.src.match(/([^\/]+%2F[^\/]+)$/);
        if (pathMatch && pathMatch[1]) {
          const newUrl = buildImageUrl(pathMatch[1]);
          if (newUrl) {
            target.src = newUrl;
            return;
          }
        }
      }

      console.log("🖼️ Échec du chargement, affichage des initiales");
      setAvatarError(true);
      target.src = getDefaultAvatar();
    },
    [getDefaultAvatar],
  );

  // Récupérer le profil VENDEUR
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAvatarError(false);

      const token = localStorage.getItem("oskar_token");
      if (!token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      const response = await api.get(API_ENDPOINTS.AUTH.VENDEUR.PROFILE);
      const data = response.data?.data || response.data;

      if (data) {
        console.log("📦 Données du profil vendeur reçues:", {
          nom: data.nom,
          prenoms: data.prenoms,
          email: data.email,
          avatar: data.avatar,
          photo: data.photo,
          registre_commerce: data.registre_commerce,
          type: data.type,
        });

        const profileData = {
          uuid: data.uuid || "",
          nom: data.nom || "",
          prenoms: data.prenoms || "",
          email: data.email || "",
          telephone: data.telephone || null,
          date_naissance: data.date_naissance || null,
          avatar: data.avatar || data.photo || null,
          photo: data.photo || null,
          registre_commerce: data.registre_commerce || null,
          type: (data.type as "standard" | "premium") || "standard",
          is_verified: data.is_verified || false,
          created_at: data.created_at || data.date_creation,
        };

        setProfile(profileData);
        setFormData(profileData);
        
        // Si un registre existe, le charger
        if (data.registre_commerce) {
          const registreData: RegistreCommerce = {
            url: buildImageUrl(data.registre_commerce) || data.registre_commerce,
            key: data.registre_commerce,
            original_name: "Registre de commerce",
            size: 0,
            mimetype: "application/pdf",
            uploaded_at: data.updated_at,
          };
          setCurrentRegistre(registreData);
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement du profil vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de charger le profil vendeur",
      );

      if (err.message?.includes("token") || err.message?.includes("Session")) {
        setTimeout(() => {
          router.push("/connexion");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Gestion des changements de formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
    setError(null);
    setSuccess(null);
  };

  // Gestion du fichier avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    setSelectedFile(file);
    setAvatarError(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
    setSuccess(null);
  };

  // ============================================
  // GESTION DU REGISTRE DE COMMERCE
  // ============================================

  const handleRegistreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    validateAndSetRegistreFile(file);
  };

  const validateAndSetRegistreFile = (file: File) => {
    // Validation du type de fichier
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError("Format de fichier non supporté. Utilisez PDF, JPEG, PNG ou GIF.");
      return;
    }

    // Validation de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("Le fichier est trop volumineux. Taille maximum : 10MB");
      return;
    }

    setSelectedRegistreFile(file);
    setError(null);

    // Créer une prévisualisation pour les images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setRegistrePreviewUrl(url);
    } else {
      setRegistrePreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetRegistreFile(file);
    }
  };

  const handleRemoveRegistreFile = () => {
    setSelectedRegistreFile(null);
    setRegistrePreviewUrl(null);
  };

  const uploadRegistre = async () => {
    if (!selectedRegistreFile) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    try {
      setUploadingRegistre(true);
      setError(null);
      setUploadProgress(0);

      // Simuler la progression
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Créer le FormData
      const formData = new FormData();
      formData.append("registre_commerce", selectedRegistreFile);

      // Appel API
      const response = await api.post<UploadResponse>(
        "/auth/upload-regis-commerce",
        formData,
        { isFormData: true }
      );

      clearInterval(interval);
      setUploadProgress(100);

      if (response.success) {
        setCurrentRegistre(response.data);
        
        // Ajouter à l'historique
        const updatedHistory = [response.data, ...registreHistory];
        setRegistreHistory(updatedHistory);

        setSuccess("Registre de commerce uploadé avec succès !");
        setTimeout(() => setSuccess(null), 5000);
        
        // Réinitialiser le formulaire
        setTimeout(() => {
          setSelectedRegistreFile(null);
          setRegistrePreviewUrl(null);
          setUploadProgress(0);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Erreur upload registre:", err);
      setError(err.message || "Erreur lors de l'upload du registre");
    } finally {
      setUploadingRegistre(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Soumission du formulaire principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("oskar_token");
      if (!token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      if (!formData.nom.trim()) throw new Error("Le nom est requis");
      if (!formData.prenoms.trim()) throw new Error("Le prénom est requis");
      if (!formData.email.trim()) throw new Error("L'email est requis");

      const formDataToSend = new FormData();
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prenoms", formData.prenoms);
      formDataToSend.append("email", formData.email);

      if (formData.telephone) {
        formDataToSend.append("telephone", formData.telephone);
      }
      if (formData.date_naissance) {
        formDataToSend.append("date_naissance", formData.date_naissance);
      }
      if (formData.type) {
        formDataToSend.append("type", formData.type);
      }
      if (selectedFile) {
        formDataToSend.append("avatar", selectedFile);
      }

      console.log("📤 Envoi vers:", API_ENDPOINTS.AUTH.VENDEUR.UPDATE_PROFILE);

      const response = await fetch(API_ENDPOINTS.AUTH.VENDEUR.UPDATE_PROFILE, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Profil mis à jour avec succès:", result);

      setSuccess(result.message || "Profil mis à jour avec succès");

      setTimeout(() => {
        fetchProfile();
        setSelectedFile(null);
        setPreviewUrl(null);
        setAvatarError(false);
      }, 1000);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil vendeur:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors de la mise à jour",
      );

      if (err.message?.includes("Session") || err.message?.includes("token")) {
        setTimeout(() => {
          router.push("/connexion");
        }, 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  // Formater la date d'inscription
  const getMemberSince = () => {
    if (!formData.created_at) return "N/A";
    try {
      return new Date(formData.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Obtenir le prénom pour l'affichage
  const getFirstName = () => {
    if (!profile) return "Vendeur";
    return formData.prenoms || profile.prenoms || "Vendeur";
  };

  // ✅ Obtenir la source de l'avatar
  const getAvatarSrc = () => {
    if (previewUrl) return previewUrl;
    return getAvatarUrl();
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* En-tête */}
            <div className="mb-4">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb p-3 bg-white rounded-3 shadow-sm">
                  <li className="breadcrumb-item">
                    <a
                      href="/dashboard-vendeur"
                      className="text-decoration-none text-success"
                    >
                      <i className="fa-solid fa-home me-1"></i>
                      Tableau de bord
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    <i className="fa-solid fa-user me-1"></i>
                    Mon profil
                  </li>
                </ol>
              </nav>
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div>
                      <h1
                        className="h2 fw-bold mb-2"
                        style={{ color: "#16a34a" }}
                      >
                        <i className="fa-solid fa-user-circle me-2"></i>
                        Gestion du profil
                      </h1>
                      <p className="text-muted mb-0">
                        Gérez vos informations personnelles et votre registre de commerce
                      </p>
                    </div>
                    <div className="mt-3 mt-md-0">
                      <button
                        onClick={() => router.push("/dashboard-vendeur")}
                        className="btn btn-outline-secondary"
                      >
                        <i className="fa-solid fa-arrow-left me-1"></i>
                        Retour au tableau de bord
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets - SUPPRIMÉ L'ONGLET SÉCURITÉ */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 p-0">
                <ul className="nav nav-tabs nav-fill border-0">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "personal" ? "active" : ""}`}
                      onClick={() => setActiveTab("personal")}
                    >
                      <i className="fa-solid fa-user-pen me-2"></i>
                      Informations personnelles
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === "registre" ? "active" : ""}`}
                      onClick={() => setActiveTab("registre")}
                    >
                      <i className="fa-solid fa-file-pdf me-2"></i>
                      Registre de commerce
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show d-flex align-items-center"
                role="alert"
              >
                <i className="fa-solid fa-circle-exclamation fs-5 me-3"></i>
                <div className="flex-grow-1">{error}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            {success && (
              <div
                className="alert alert-success alert-dismissible fade show d-flex align-items-center"
                role="alert"
              >
                <i className="fa-solid fa-circle-check fs-5 me-3"></i>
                <div className="flex-grow-1">{success}</div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSuccess(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Contenu */}
            <div className="tab-content">
              {/* Onglet Informations personnelles */}
              <div
                className={`tab-pane fade ${activeTab === "personal" ? "show active" : ""}`}
              >
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-4">
                    <h5 className="mb-0">
                      <i className="fa-solid fa-id-card text-success me-2"></i>
                      Vos informations personnelles
                    </h5>
                    <p className="text-muted mb-0 mt-2 small">
                      Mettez à jour vos informations de contact et votre photo
                      de profil
                    </p>
                  </div>
                  <div className="card-body p-4">
                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-success"
                          style={{ width: "3rem", height: "3rem" }}
                          role="status"
                        >
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-3 text-muted fs-5">
                          Chargement de votre profil...
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Colonne gauche - Avatar */}
                          <div className="col-12 col-md-4 mb-4 mb-md-0">
                            <div className="sticky-top" style={{ top: "20px" }}>
                              <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center p-4">
                                  <div className="mb-4">
                                    <div className="position-relative d-inline-block">
                                      <div className="avatar-upload-wrapper">
                                        <img
                                          src={getAvatarSrc()}
                                          alt="Avatar"
                                          className="rounded-circle border border-4 border-success shadow"
                                          style={{
                                            width: "180px",
                                            height: "180px",
                                            objectFit: "cover",
                                          }}
                                          onError={handleImageError}
                                        />
                                        {formData.is_verified && (
                                          <div
                                            className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                                            style={{
                                              width: "36px",
                                              height: "36px",
                                            }}
                                            title="Compte vérifié"
                                          >
                                            <i className="fa-solid fa-check text-white"></i>
                                          </div>
                                        )}
                                        <div className="avatar-overlay rounded-circle">
                                          <label
                                            htmlFor="avatar-upload"
                                            className="btn btn-success btn-lg rounded-circle shadow-lg"
                                            style={{
                                              width: "50px",
                                              height: "50px",
                                            }}
                                            title="Changer la photo"
                                          >
                                            <i className="fa-solid fa-camera fa-lg"></i>
                                            <span className="visually-hidden">
                                              Changer la photo
                                            </span>
                                          </label>
                                          <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="visually-hidden"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mb-4">
                                    <h6 className="fw-bold mb-2">
                                      Photo de profil
                                    </h6>
                                    <p className="text-muted small mb-2">
                                      JPG, PNG ou GIF (Max 5MB)
                                    </p>
                                    {selectedFile && (
                                      <div className="alert alert-success py-2 px-3 small">
                                        <i className="fa-solid fa-check-circle me-2"></i>
                                        {selectedFile.name}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-start">
                                    <h6 className="fw-bold mb-3 text-success">
                                      <i className="fa-solid fa-lightbulb me-2"></i>
                                      Recommandations :
                                    </h6>
                                    <ul className="list-unstyled text-muted">
                                      <li className="mb-2 d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>
                                          Photo récente et de bonne qualité
                                        </span>
                                      </li>
                                      <li className="mb-2 d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>Visage clairement visible</span>
                                      </li>
                                      <li className="mb-2 d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>Format carré recommandé</span>
                                      </li>
                                      <li className="d-flex align-items-start">
                                        <i className="fa-solid fa-check-circle text-success me-2 mt-1"></i>
                                        <span>Arrière-plan neutre</span>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Colonne droite - Formulaire */}
                          <div className="col-12 col-md-8">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-body p-4">
                                <div className="row g-4">
                                  {/* Type de vendeur */}
                                  <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">
                                      <i className="fa-solid fa-store me-2 text-muted"></i>
                                      Type de vendeur
                                    </label>
                                    <select
                                      id="type"
                                      name="type"
                                      className="form-select form-select-lg"
                                      value={formData.type || "standard"}
                                      onChange={handleInputChange}
                                      disabled={saving}
                                    >
                                      <option value="standard">Standard</option>
                                      <option value="premium">Premium</option>
                                    </select>
                                  </div>

                                  {/* Nom */}
                                  <div className="col-12 col-md-6">
                                    <label
                                      htmlFor="nom"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-signature me-2 text-muted"></i>
                                      Nom *
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-user text-muted"></i>
                                      </span>
                                      <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        className="form-control border-start-0"
                                        placeholder="Votre nom"
                                        required
                                        disabled={saving}
                                      />
                                    </div>
                                  </div>

                                  {/* Prénoms */}
                                  <div className="col-12 col-md-6">
                                    <label
                                      htmlFor="prenoms"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-user-tag me-2 text-muted"></i>
                                      Prénoms *
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-user-pen text-muted"></i>
                                      </span>
                                      <input
                                        type="text"
                                        id="prenoms"
                                        name="prenoms"
                                        value={formData.prenoms}
                                        onChange={handleInputChange}
                                        className="form-control border-start-0"
                                        placeholder="Vos prénoms"
                                        required
                                        disabled={saving}
                                      />
                                    </div>
                                  </div>

                                  {/* Date de naissance */}
                                  <div className="col-12 col-md-6">
                                    <label
                                      htmlFor="date_naissance"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-cake-candles me-2 text-muted"></i>
                                      Date de naissance
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-calendar text-muted"></i>
                                      </span>
                                      <input
                                        type="date"
                                        id="date_naissance"
                                        name="date_naissance"
                                        value={formData.date_naissance || ""}
                                        onChange={handleInputChange}
                                        className="form-control border-start-0"
                                        disabled={saving}
                                      />
                                    </div>
                                  </div>

                                  {/* Email */}
                                  <div className="col-12">
                                    <label
                                      htmlFor="email"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-at me-2 text-muted"></i>
                                      Email *
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-envelope text-muted"></i>
                                      </span>
                                      <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-control border-start-0"
                                        placeholder="votre@email.com"
                                        required
                                        disabled={saving}
                                      />
                                    </div>
                                  </div>

                                  {/* Téléphone */}
                                  <div className="col-12">
                                    <label
                                      htmlFor="telephone"
                                      className="form-label fw-semibold"
                                    >
                                      <i className="fa-solid fa-mobile-screen me-2 text-muted"></i>
                                      Téléphone
                                    </label>
                                    <div className="input-group input-group-lg">
                                      <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-phone text-muted"></i>
                                      </span>
                                      <input
                                        type="tel"
                                        id="telephone"
                                        name="telephone"
                                        value={formData.telephone || ""}
                                        onChange={handleInputChange}
                                        className="form-control border-start-0"
                                        placeholder="+225 XX XX XX XX"
                                        disabled={saving}
                                      />
                                    </div>
                                  </div>

                                  {/* Informations de compte */}
                                  <div className="col-12">
                                    <div className="card bg-light border-0 mt-2">
                                      <div className="card-body">
                                        <h6 className="fw-bold mb-3 text-success">
                                          <i className="fa-solid fa-circle-info me-2"></i>
                                          Informations de compte
                                        </h6>
                                        <div className="row">
                                          <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                                <i className="fa-solid fa-user-check text-success fa-lg"></i>
                                              </div>
                                              <div>
                                                <p className="fw-medium mb-0">
                                                  Statut du compte
                                                </p>
                                                <p className="text-muted small mb-0">
                                                  {formData.is_verified
                                                    ? "Vérifié ✓"
                                                    : "En attente"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                              <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                                <i className="fa-solid fa-calendar-days text-info fa-lg"></i>
                                              </div>
                                              <div>
                                                <p className="fw-medium mb-0">
                                                  Membre depuis
                                                </p>
                                                <p className="text-muted small mb-0">
                                                  {getMemberSince()}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="row mt-4">
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-body p-4">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                                  <div className="text-center text-md-start">
                                    <p className="text-muted mb-0 small">
                                      <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                      Les champs marqués d'un * sont
                                      obligatoires
                                    </p>
                                  </div>
                                  <div className="d-flex flex-wrap justify-content-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push("/dashboard-vendeur")
                                      }
                                      className="btn btn-outline-secondary btn-lg"
                                      disabled={saving}
                                    >
                                      <i className="fa-solid fa-times me-2"></i>
                                      Annuler
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          "/dashboard-vendeur/parametres/password",
                                        )
                                      }
                                      className="btn btn-outline-primary btn-lg"
                                      disabled={saving}
                                    >
                                      <i className="fa-solid fa-key me-2"></i>
                                      Changer mot de passe
                                    </button>
                                    <button
                                      type="submit"
                                      className="btn btn-success btn-lg px-5"
                                      disabled={saving}
                                    >
                                      {saving ? (
                                        <>
                                          <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                          ></span>
                                          Enregistrement...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fa-solid fa-floppy-disk me-2"></i>
                                          Enregistrer les modifications
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Onglet Registre de commerce */}
              <div
                className={`tab-pane fade ${activeTab === "registre" ? "show active" : ""}`}
              >
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0 py-4">
                    <h5 className="mb-0">
                      <i className="fa-solid fa-file-pdf text-danger me-2"></i>
                      Registre de commerce
                    </h5>
                    <p className="text-muted mb-0 mt-2 small">
                      Gérez votre registre de commerce (RCCM) - Format PDF, JPEG, PNG (Max 10MB)
                    </p>
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-12 col-md-6 mb-4">
                        {/* Registre actuel */}
                        <div className="card h-100 border">
                          <div className="card-header bg-light border-0 py-3">
                            <h6 className="fw-bold mb-0">
                              <i className="fa-solid fa-eye me-2 text-success"></i>
                              Registre actuel
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            {currentRegistre ? (
                              <div className="text-center">
                                <div className="mb-4">
                                  <div
                                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                                    style={{
                                      width: "80px",
                                      height: "80px",
                                      backgroundColor: currentRegistre.mimetype.includes("pdf") 
                                        ? "#FEE2E2" 
                                        : colors.oskar.green + "20",
                                      color: currentRegistre.mimetype.includes("pdf")
                                        ? "#DC2626"
                                        : colors.oskar.green,
                                      fontSize: "2rem",
                                    }}
                                  >
                                    <i className={`fa-solid ${currentRegistre.mimetype.includes("pdf") ? "fa-file-pdf" : "fa-file-image"}`}></i>
                                  </div>
                                </div>
                                <h6 className="fw-bold mb-2">{currentRegistre.original_name}</h6>
                                <p className="text-muted small mb-3">
                                  {formatFileSize(currentRegistre.size)}
                                </p>
                                <div className="d-flex justify-content-center gap-2">
                                  <a
                                    href={currentRegistre.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary btn-sm"
                                  >
                                    <i className="fa-solid fa-eye me-1"></i>
                                    Voir
                                  </a>
                                  <a
                                    href={currentRegistre.url}
                                    download={currentRegistre.original_name}
                                    className="btn btn-outline-success btn-sm"
                                  >
                                    <i className="fa-solid fa-download me-1"></i>
                                    Télécharger
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-5">
                                <div
                                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "64px",
                                    height: "64px",
                                    backgroundColor: colors.oskar.lightGrey,
                                    color: colors.oskar.grey,
                                    fontSize: "1.5rem",
                                  }}
                                >
                                  <i className="fa-solid fa-file-pdf"></i>
                                </div>
                                <p className="text-muted mb-3">
                                  Aucun registre de commerce uploadé
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 mb-4">
                        {/* Upload nouveau registre */}
                        <div className="card h-100 border">
                          <div className="card-header bg-light border-0 py-3">
                            <h6 className="fw-bold mb-0">
                              <i className="fa-solid fa-upload me-2 text-warning"></i>
                              Mettre à jour le registre
                            </h6>
                          </div>
                          <div className="card-body p-4">
                            {/* Zone de drop */}
                            <div
                              className={`border-2 border-dashed rounded-3 p-4 mb-3 text-center ${
                                dragActive ? "bg-light" : ""
                              }`}
                              style={{
                                borderColor: dragActive ? colors.oskar.green : colors.oskar.lightGrey,
                                backgroundColor: dragActive ? colors.oskar.green + "10" : "white",
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                              }}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                              onClick={() => document.getElementById("registre-upload")?.click()}
                            >
                              <input
                                id="registre-upload"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.gif"
                                onChange={handleRegistreFileChange}
                                className="visually-hidden"
                              />

                              {selectedRegistreFile ? (
                                <div className="text-center">
                                  {registrePreviewUrl ? (
                                    <img
                                      src={registrePreviewUrl}
                                      alt="Aperçu"
                                      className="rounded-3 mb-3"
                                      style={{
                                        maxWidth: "150px",
                                        maxHeight: "150px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        backgroundColor: colors.oskar.green + "20",
                                        color: colors.oskar.green,
                                        fontSize: "1.25rem",
                                      }}
                                    >
                                      <i className="fa-solid fa-file-pdf"></i>
                                    </div>
                                  )}

                                  <h6 className="fw-semibold mb-2 small">
                                    {selectedRegistreFile.name}
                                  </h6>
                                  <p className="text-muted small mb-2">
                                    {formatFileSize(selectedRegistreFile.size)}
                                  </p>

                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveRegistreFile();
                                    }}
                                  >
                                    <i className="fa-solid fa-times me-1"></i>
                                    Supprimer
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div
                                    className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      backgroundColor: colors.oskar.green + "20",
                                      color: colors.oskar.green,
                                      fontSize: "1.25rem",
                                    }}
                                  >
                                    <i className="fa-solid fa-cloud-upload-alt"></i>
                                  </div>
                                  <p className="fw-medium mb-1 small">
                                    Glissez-déposez votre fichier
                                  </p>
                                  <p className="text-muted small mb-2">
                                    ou cliquez pour parcourir
                                  </p>
                                  <p className="text-muted small mb-0">
                                    PDF, JPEG, PNG (Max 10MB)
                                  </p>
                                </>
                              )}
                            </div>

                            {/* Barre de progression */}
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="small text-muted">Upload...</span>
                                  <span className="small fw-semibold">{uploadProgress}%</span>
                                </div>
                                <div className="progress" style={{ height: "6px" }}>
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${uploadProgress}%`,
                                      backgroundColor: colors.oskar.green,
                                      transition: "width 0.2s ease",
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Bouton d'upload */}
                            <button
                              className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                              onClick={uploadRegistre}
                              disabled={uploadingRegistre || !selectedRegistreFile}
                            >
                              {uploadingRegistre ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                  <span>Upload en cours...</span>
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-upload"></i>
                                  <span>Uploader le registre</span>
                                </>
                              )}
                            </button>

                            {currentRegistre && (
                              <div className="mt-3 p-3 bg-light rounded-3">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="fa-solid fa-clock text-muted" style={{ fontSize: "0.75rem" }}></i>
                                  <p className="small text-muted mb-0">
                                    Dernier upload : {currentRegistre.uploaded_at 
                                      ? new Date(currentRegistre.uploaded_at).toLocaleDateString("fr-FR")
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Informations importantes */}
                      <div className="col-12">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            backgroundColor: colors.oskar.blue + "10",
                            border: `1px solid ${colors.oskar.blue}30`,
                          }}
                        >
                          <div className="d-flex gap-3">
                            <i
                              className="fa-solid fa-circle-info"
                              style={{ color: colors.oskar.blue }}
                            ></i>
                            <div>
                              <h6 className="fw-semibold mb-2">
                                Informations importantes
                              </h6>
                              <ul className="small text-muted mb-0 ps-3">
                                <li className="mb-1">
                                  Le registre de commerce (RCCM) est obligatoire pour les vendeurs professionnels
                                </li>
                                <li className="mb-1">
                                  Formats acceptés : PDF, JPEG, PNG, GIF (taille max : 10MB)
                                </li>
                                <li className="mb-1">
                                  Assurez-vous que le document est lisible et à jour
                                </li>
                                <li className="mb-1">
                                  Le registre sera vérifié par nos équipes dans un délai de 24-48h
                                </li>
                                <li>
                                  Une fois vérifié, votre statut de vendeur sera mis à jour
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .breadcrumb {
          background-color: transparent;
          padding: 0;
        }
        .breadcrumb-item.active {
          color: #16a34a;
        }
        .card {
          border-radius: 15px;
          transition: transform 0.2s ease-in-out;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .form-control:focus,
        .form-select:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 0.25rem rgba(22, 163, 74, 0.25);
        }
        .btn-success {
          background-color: #16a34a;
          border-color: #16a34a;
        }
        .btn-success:hover {
          background-color: #15803d;
          border-color: #15803d;
        }
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          border-bottom: 3px solid transparent;
          padding: 1rem 1.5rem;
          font-weight: 500;
        }
        .nav-tabs .nav-link.active {
          color: #16a34a;
          border-bottom: 3px solid #16a34a;
          background-color: transparent;
        }
        .nav-tabs .nav-link:hover:not(.active) {
          color: #16a34a;
          border-bottom-color: rgba(22, 163, 74, 0.3);
        }
        .avatar-upload-wrapper {
          position: relative;
          display: inline-block;
        }
        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          border: 4px solid transparent;
        }
        .avatar-upload-wrapper:hover .avatar-overlay {
          opacity: 1;
        }
        .input-group-text {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }
        .progress {
          background-color: #e9ecef;
          border-radius: 10px;
        }
        .progress-bar {
          border-radius: 10px;
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
}