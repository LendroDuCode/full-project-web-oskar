"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";
import colors from "@/app/shared/constants/colors";

// ============================================
// FONCTION DE CONSTRUCTION D'URL D'IMAGE - SIMPLIFIÉE
// ============================================
const buildImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  // Nettoyer le chemin
  let cleanPath = imagePath.trim();

  // ✅ Si c'est déjà une URL complète, la retourner
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
  const filesUrl = "/api/files";

  // ✅ Construire l'URL avec le chemin tel quel (sans encodage)
  // Le navigateur encodera automatiquement
  return `${apiUrl}${filesUrl}/${cleanPath}`;
};

interface AdminProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  nom_complet?: string;
  email: string;
  telephone?: string;
  avatar: string | null;
  avatar_key: string | null;
  photo: string | null;
  photo_key: string | null;
  civilite?: {
    uuid: string;
    libelle: string;
  };
  role_uuid: string;
  is_verified: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  indicatif?: string;
  birth_date?: string;
}

interface Civilite {
  uuid: string;
  libelle: string;
  slug: string;
  is_active: boolean;
}

export default function ModifierProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [civilites, setCivilites] = useState<Civilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarError, setAvatarError] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    telephone: "",
    indicatif: "225",
    civilite_uuid: "",
    birth_date: "",
    avatar: "",
    avatar_key: "",
  });

  // Récupérer le profil et les civilités
  useEffect(() => {
    fetchProfile();
    fetchCivilites();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setAvatarError(false);

      const response = await api.get(API_ENDPOINTS.AUTH.ADMIN.PROFILE);

      console.log("📥 Données du profil admin reçues:", response.data);

      // Gérer différents formats de réponse
      let profileData = response.data;
      if (response.data?.data) {
        profileData = response.data.data;
      } else if (response.data?.status === "success" && response.data.data) {
        profileData = response.data.data;
      }

      console.log("✅ Avatar (chemin relatif):", profileData.avatar);
      console.log("✅ Avatar_key (chemin relatif):", profileData.avatar_key);
      console.log("⚠️ Photo (URL complète):", profileData.photo);

      setProfile(profileData);

      // Traitement du téléphone
      let telephone = profileData.telephone || "";
      let indicatif = "225";

      if (telephone) {
        if (telephone.startsWith("225")) {
          indicatif = "225";
          telephone = telephone.substring(3);
        } else if (telephone.startsWith("+225")) {
          indicatif = "225";
          telephone = telephone.substring(4);
        }
        telephone = telephone.replace(/\D/g, "");
      }

      // Traitement du nom
      let nom = profileData.nom || "";
      let prenoms = profileData.prenoms || "";

      if ((!nom || !prenoms) && profileData.nom_complet) {
        const parts = profileData.nom_complet.split(" ");
        if (parts.length > 0) {
          nom = parts[parts.length - 1];
          prenoms = parts.slice(0, -1).join(" ");
        }
      }

      // Date de naissance
      let birth_date = "";
      if (profileData.birth_date) {
        try {
          const date = new Date(profileData.birth_date);
          if (!isNaN(date.getTime())) {
            birth_date = date.toISOString().split("T")[0];
          }
        } catch (e) {
          console.error("Erreur de format de date:", e);
        }
      }

      // Civilité
      let civilite_uuid = "";
      if (profileData.civilite?.uuid) {
        civilite_uuid = profileData.civilite.uuid;
      }

      // ✅ PRIORITÉ AU CHEMIN RELATIF (avatar plutôt que photo)
      const avatarPath = profileData.avatar || profileData.avatar_key || "";

      setFormData({
        nom: nom.trim(),
        prenoms: prenoms.trim(),
        email: profileData.email || "",
        telephone: telephone,
        indicatif: indicatif,
        civilite_uuid: civilite_uuid,
        birth_date: birth_date,
        avatar: avatarPath,
        avatar_key: profileData.avatar_key || profileData.avatar || "",
      });
    } catch (err: any) {
      console.error("❌ Erreur lors de la récupération du profil admin:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de charger le profil administrateur",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCivilites = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CIVILITES.ACTIVES);
      let civilitesData = response.data;

      if (response.data?.data) {
        civilitesData = response.data.data;
      } else if (response.data?.status === "success" && response.data.data) {
        civilitesData = response.data.data;
      }

      if (Array.isArray(civilitesData)) {
        setCivilites(civilitesData);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des civilités:", err);
    }
  };

  // ✅ VERSION SIMPLIFIÉE - PLUS D'ENCODAGE MANUEL
  const getAvatarUrl = useCallback(() => {
    if (!profile) return getDefaultAvatar("A");

    if (avatarError) {
      return getDefaultAvatar(profile.nom || "A");
    }

    // ✅ Utiliser le chemin relatif directement
    const imagePath =
      formData.avatar || formData.avatar_key || profile.photo || "";

    if (imagePath) {
      const url = buildImageUrl(imagePath);
      console.log("🖼️ URL construite:", url);
      return url;
    }

    return getDefaultAvatar(profile.nom || "A");
  }, [profile, formData.avatar, formData.avatar_key, avatarError]);

  const getDefaultAvatar = (nom: string) => {
    const initials = nom ? nom.charAt(0).toUpperCase() : "A";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${encodeURIComponent(colors.oskar.green.replace("#", ""))}&color=fff&size=200&bold=true`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;

      // ✅ Correction simple pour localhost
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

      setAvatarError(true);
      target.src = getDefaultAvatar(profile?.nom || "A");
    },
    [profile],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("oskar_token");
      console.log("🔑 Token récupéré:", token ? "Présent" : "Absent");

      if (!token) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }

      const formDataToSend = new FormData();
      const telephoneComplet = `${formData.indicatif}${formData.telephone}`;

      if (!formData.nom.trim()) {
        throw new Error("Le nom est requis");
      }
      if (!formData.prenoms.trim()) {
        throw new Error("Le prénom est requis");
      }
      if (!formData.email.trim()) {
        throw new Error("L'email est requis");
      }

      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prenoms", formData.prenoms);
      formDataToSend.append("email", formData.email);

      if (telephoneComplet && telephoneComplet !== "225") {
        formDataToSend.append("telephone", telephoneComplet);
      }

      if (formData.civilite_uuid) {
        formDataToSend.append("civilite_uuid", formData.civilite_uuid);
      }

      if (formData.birth_date) {
        formDataToSend.append("birth_date", formData.birth_date);
      }

      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append("photo", fileInputRef.current.files[0]);
      }

      console.log("📤 Envoi vers:", API_ENDPOINTS.AUTH.ADMIN.MODIFIER_PROFILE);

      const response = await fetch(API_ENDPOINTS.AUTH.ADMIN.MODIFIER_PROFILE, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log("📥 Statut réponse:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        let errorMessage = `Erreur ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Réponse du serveur:", result);

      setSuccess("Profil administrateur mis à jour avec succès !");

      setTimeout(() => {
        fetchProfile();
        setPreviewImage(null);
      }, 1000);
    } catch (err: any) {
      console.error("❌ Erreur lors de la mise à jour du profil admin:", err);
      setError(
        err.message ||
          "Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.",
      );
    } finally {
      setSaving(false);
    }
  };

  const getFirstName = () => {
    if (!profile) return "Administrateur";
    return formData.prenoms || profile.prenoms || "Administrateur";
  };

  const getProfileStats = () => {
    const stats = [
      {
        title: "Compte actif depuis",
        value: profile?.created_at
          ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
            })
          : "N/A",
        icon: "calendar-check",
        color: colors.oskar.green,
      },
      {
        title: "Dernière mise à jour",
        value: profile?.updated_at
          ? new Date(profile.updated_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A",
        icon: "clock-rotate-left",
        color: colors.oskar.darkGreen,
      },
      {
        title: "Statut du compte",
        value: profile?.is_verified ? "Vérifié ✓" : "En attente",
        icon: "shield-check",
        color: profile?.is_verified ? colors.oskar.green : colors.oskar.green,
      },
      {
        title: "Niveau d'accès",
        value: "Administrateur",
        icon: "user-shield",
        color: colors.oskar.darkGreen,
      },
    ];

    return stats;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5 text-center">
                <div className="position-relative">
                  <div
                    className="spinner-border mb-4"
                    style={{
                      width: "4rem",
                      height: "4rem",
                      borderColor: colors.oskar.green,
                      borderRightColor: "transparent",
                    }}
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <i
                      className="fa-solid fa-user-shield fa-2x opacity-75"
                      style={{ color: colors.oskar.green }}
                    ></i>
                  </div>
                </div>
                <h4
                  className="fw-bold mb-3"
                  style={{ color: colors.oskar.green }}
                >
                  Chargement de votre profil...
                </h4>
                <p className="text-muted fs-5">
                  Nous préparons votre espace administrateur
                </p>
                <div className="progress mt-4" style={{ height: "6px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    style={{
                      width: "75%",
                      backgroundColor: colors.oskar.green,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          {/* Fil d'Ariane */}
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb bg-white p-3 rounded-4 shadow-sm">
              <li className="breadcrumb-item">
                <a
                  href="/dashboard-admin"
                  className="text-decoration-none fw-semibold d-flex align-items-center gap-2"
                  style={{ color: colors.oskar.green }}
                >
                  <i
                    className="fa-solid fa-gauge-high"
                    style={{ color: colors.oskar.green }}
                  ></i>
                  <span className="d-none d-md-inline">Tableau de bord</span>
                </a>
              </li>
              <li
                className="breadcrumb-item active fw-bold"
                style={{ color: colors.oskar.green }}
              >
                <i className="fa-solid fa-user-gear me-2"></i>
                Profil Administrateur
              </li>
            </ol>
          </nav>

          {/* En-tête principal */}
          <div className="card border-0 shadow-lg overflow-hidden mb-4">
            <div
              className="card-header py-4 border-0 text-white"
              style={{ backgroundColor: colors.oskar.green }}
            >
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 className="h2 fw-bold mb-2">
                    <i className="fa-solid fa-user-shield me-3"></i>
                    Gestion du Profil Administrateur
                  </h1>
                  <p className="mb-0 opacity-75">
                    Gérez vos informations personnelles et votre compte
                    administrateur
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <button
                    onClick={() => router.push("/dashboard-admin")}
                    className="btn btn-light btn-lg rounded-pill px-4"
                    style={{ color: colors.oskar.green }}
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i>
                    Retour
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages d'alerte */}
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-4 shadow-lg"
              style={{ zIndex: 9999, maxWidth: "400px" }}
            >
              <div className="d-flex align-items-center">
                <i className="fa-solid fa-circle-exclamation fs-4 me-3"></i>
                <div>
                  <strong className="fw-bold">Erreur</strong>
                  <p className="mb-0 small">{error}</p>
                </div>
                <button
                  type="button"
                  className="btn-close ms-3"
                  onClick={() => setError(null)}
                ></button>
              </div>
            </div>
          )}

          {success && (
            <div
              className="alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-4 shadow-lg"
              style={{ zIndex: 9999, maxWidth: "400px" }}
            >
              <div className="d-flex align-items-center">
                <i className="fa-solid fa-circle-check fs-4 me-3"></i>
                <div>
                  <strong className="fw-bold">Succès</strong>
                  <p className="mb-0 small">{success}</p>
                </div>
                <button
                  type="button"
                  className="btn-close ms-3"
                  onClick={() => setSuccess(null)}
                ></button>
              </div>
            </div>
          )}

          {/* Onglets de navigation */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <ul className="nav nav-pills nav-fill p-3">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                    style={
                      activeTab === "profile"
                        ? {
                            backgroundColor: colors.oskar.green,
                            color: "white",
                            borderColor: colors.oskar.green,
                          }
                        : {
                            color: "#374151",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    <i className="fa-solid fa-user me-2"></i>
                    Profil
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                    style={
                      activeTab === "security"
                        ? {
                            backgroundColor: colors.oskar.green,
                            color: "white",
                            borderColor: colors.oskar.green,
                          }
                        : {
                            color: "#374151",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    <i className="fa-solid fa-shield-halved me-2"></i>
                    Sécurité
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "preferences" ? "active" : ""}`}
                    onClick={() => setActiveTab("preferences")}
                    style={
                      activeTab === "preferences"
                        ? {
                            backgroundColor: colors.oskar.green,
                            color: "white",
                            borderColor: colors.oskar.green,
                          }
                        : {
                            color: "#374151",
                            borderColor: "#e5e7eb",
                          }
                    }
                  >
                    <i className="fa-solid fa-sliders me-2"></i>
                    Préférences
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contenu de l'onglet Profil */}
          {activeTab === "profile" && (
            <>
              {/* Section de présentation avec avatar */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="row align-items-center">
                        <div className="col-md-auto text-center mb-3 mb-md-0">
                          <div className="position-relative d-inline-block">
                            <img
                              src={previewImage || getAvatarUrl()}
                              alt="Photo administrateur"
                              className="rounded-circle border border-4 border-white shadow-lg"
                              style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                              }}
                              onError={handleImageError}
                            />
                            <button
                              onClick={triggerFileInput}
                              className="btn rounded-circle position-absolute bottom-0 end-0 shadow-lg d-flex align-items-center justify-content-center"
                              style={{
                                width: "48px",
                                height: "48px",
                                border: "4px solid white",
                                backgroundColor: colors.oskar.green,
                                color: "white",
                              }}
                              title="Changer la photo"
                              type="button"
                            >
                              <i className="fa-solid fa-camera"></i>
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="d-none"
                            />
                          </div>
                        </div>
                        <div className="col-md">
                          <h2 className="fw-bold mb-2">
                            👋 Bonjour, {getFirstName()} !
                            <span
                              className="badge ms-3"
                              style={{
                                backgroundColor: colors.oskar.green,
                                color: "white",
                              }}
                            >
                              <i className="fa-solid fa-star me-1"></i>
                              Administrateur
                            </span>
                          </h2>
                          <p className="text-muted mb-3">
                            <i className="fa-solid fa-envelope me-2"></i>
                            {formData.email}
                          </p>
                          <div className="row g-3">
                            {getProfileStats().map((stat, index) => (
                              <div key={index} className="col-sm-6 col-md-3">
                                <div className="d-flex align-items-center">
                                  <div
                                    className="rounded-circle p-2 me-2"
                                    style={{
                                      backgroundColor: `${stat.color}20`,
                                    }}
                                  >
                                    <i
                                      className={`fa-solid fa-${stat.icon}`}
                                      style={{ color: stat.color }}
                                    ></i>
                                  </div>
                                  <div>
                                    <div className="small text-muted">
                                      {stat.title}
                                    </div>
                                    <div className="fw-semibold small">
                                      {stat.value}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulaire de modification */}
              <div className="row">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 border-bottom">
                      <h5 className="fw-bold mb-0 d-flex align-items-center">
                        <i
                          className="fa-solid fa-user-edit me-3"
                          style={{ color: colors.oskar.green }}
                        ></i>
                        Informations personnelles
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                          {/* Prénoms */}
                          <div className="col-md-6">
                            <label
                              htmlFor="prenoms"
                              className="form-label fw-semibold"
                            >
                              <i className="fa-solid fa-user me-2 text-success"></i>
                              Prénom(s) <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="prenoms"
                              name="prenoms"
                              value={formData.prenoms}
                              onChange={handleInputChange}
                              required
                              disabled={saving}
                              placeholder="Votre prénom"
                            />
                          </div>

                          {/* Nom */}
                          <div className="col-md-6">
                            <label
                              htmlFor="nom"
                              className="form-label fw-semibold"
                            >
                              <i className="fa-solid fa-user-tag me-2 text-success"></i>
                              Nom <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-lg"
                              id="nom"
                              name="nom"
                              value={formData.nom}
                              onChange={handleInputChange}
                              required
                              disabled={saving}
                              placeholder="Votre nom"
                            />
                          </div>

                          {/* Civilité */}
                          <div className="col-md-6">
                            <label
                              htmlFor="civilite_uuid"
                              className="form-label fw-semibold"
                            >
                              <i className="fa-solid fa-venus-mars me-2 text-success"></i>
                              Civilité
                            </label>
                            <select
                              className="form-select form-select-lg"
                              id="civilite_uuid"
                              name="civilite_uuid"
                              value={formData.civilite_uuid}
                              onChange={handleInputChange}
                              disabled={saving}
                            >
                              <option value="">
                                Sélectionnez une civilité
                              </option>
                              {civilites.map((civilite) => (
                                <option
                                  key={civilite.uuid}
                                  value={civilite.uuid}
                                >
                                  {civilite.libelle}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Date de naissance */}
                          <div className="col-md-6">
                            <label
                              htmlFor="birth_date"
                              className="form-label fw-semibold"
                            >
                              <i className="fa-solid fa-cake-candles me-2 text-success"></i>
                              Date de naissance
                            </label>
                            <input
                              type="date"
                              className="form-control form-control-lg"
                              id="birth_date"
                              name="birth_date"
                              value={formData.birth_date}
                              onChange={handleInputChange}
                              disabled={saving}
                              max={new Date().toISOString().split("T")[0]}
                            />
                          </div>

                          {/* Email */}
                          <div className="col-12">
                            <label
                              htmlFor="email"
                              className="form-label fw-semibold"
                            >
                              <i className="fa-solid fa-envelope me-2 text-success"></i>
                              Adresse email{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="email"
                              className="form-control form-control-lg"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              disabled={saving}
                              placeholder="exemple@email.com"
                            />
                          </div>

                          {/* Téléphone */}
                          <div className="col-12">
                            <label
                              htmlFor="telephone"
                              className="form-label fw-semibold"
                            >
                              <i className="fa-solid fa-phone me-2 text-success"></i>
                              Téléphone
                            </label>
                            <div className="input-group">
                              <span className="input-group-text bg-light">
                                +
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                style={{ maxWidth: "100px" }}
                                id="indicatif"
                                name="indicatif"
                                value={formData.indicatif}
                                onChange={handleInputChange}
                                maxLength={3}
                                disabled={saving}
                                placeholder="225"
                              />
                              <input
                                type="tel"
                                className="form-control"
                                id="telephone"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleInputChange}
                                disabled={saving}
                                placeholder="0700000000"
                              />
                            </div>
                            <div className="form-text">
                              <i className="fa-solid fa-circle-info me-1 text-success"></i>
                              Format: +225 0700000000
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-5 pt-4 border-top">
                          <p className="text-muted small mb-0">
                            <i className="fa-solid fa-circle-info me-2 text-success"></i>
                            Les champs marqués d'un{" "}
                            <span className="text-danger">*</span> sont
                            obligatoires
                          </p>
                          <div className="d-flex gap-3">
                            <button
                              type="button"
                              onClick={() => router.push("/dashboard-admin")}
                              className="btn btn-outline-secondary px-4 rounded-pill"
                              disabled={saving}
                            >
                              <i className="fa-solid fa-times me-2"></i>
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className="btn px-4 rounded-pill shadow-sm text-white"
                              style={{ backgroundColor: colors.oskar.green }}
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Enregistrement...
                                </>
                              ) : (
                                <>
                                  <i className="fa-solid fa-floppy-disk me-2"></i>
                                  Enregistrer
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Onglet Sécurité */}
          {activeTab === "security" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="fw-bold mb-0 d-flex align-items-center">
                  <i
                    className="fa-solid fa-shield-halved me-3"
                    style={{ color: colors.oskar.green }}
                  ></i>
                  Sécurité du compte
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="rounded-circle p-3 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.green}20`,
                            }}
                          >
                            <i
                              className="fa-solid fa-key fa-xl"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">Mot de passe</h6>
                            <p className="text-muted small mb-0">
                              Modifiez votre mot de passe
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            router.push("/auth/admin/forgot-password")
                          }
                          className="btn w-100"
                          style={{
                            borderColor: colors.oskar.green,
                            color: colors.oskar.green,
                          }}
                        >
                          <i className="fa-solid fa-key me-2"></i>
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="rounded-circle p-3 me-3"
                            style={{
                              backgroundColor: `${colors.oskar.green}20`,
                            }}
                          >
                            <i
                              className="fa-solid fa-mobile-screen fa-xl"
                              style={{ color: colors.oskar.green }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">
                              Authentification à deux facteurs
                            </h6>
                            <p className="text-muted small mb-0">
                              Sécurisez votre compte
                            </p>
                          </div>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="2faSwitch"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="2faSwitch"
                          >
                            Activer la 2FA
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Préférences */}
          {activeTab === "preferences" && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="fw-bold mb-0 d-flex align-items-center">
                  <i
                    className="fa-solid fa-sliders me-3"
                    style={{ color: colors.oskar.green }}
                  ></i>
                  Préférences
                </h5>
              </div>
              <div className="card-body p-4">
                <p className="text-center text-muted">
                  <i className="fa-solid fa-sliders me-2"></i>
                  Page de préférences en cours de développement...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .form-control:focus,
        .form-select:focus {
          border-color: ${colors.oskar.green};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.green}25;
        }

        .nav-pills .nav-link.active {
          background-color: ${colors.oskar.green} !important;
        }

        .btn[style*="background-color: ${colors.oskar.green}"]:hover {
          background-color: ${colors.oskar.greenHover} !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 100, 0, 0.2);
        }

        .breadcrumb {
          background: ${colors.oskar.green}10;
        }

        .breadcrumb-item.active {
          color: ${colors.oskar.green};
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
