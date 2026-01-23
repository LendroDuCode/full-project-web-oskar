"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { api } from "@/lib/api-client";

interface AdminProfile {
  uuid: string;
  nom: string;
  prenoms: string;
  nom_complet?: string;
  email: string;
  telephone?: string;
  avatar?: string;
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
  photo?: string;
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

  // États du formulaire avec valeurs par défaut
  const [formData, setFormData] = useState({
    nom: "",
    prenoms: "",
    email: "",
    telephone: "",
    indicatif: "225",
    civilite_uuid: "",
    birth_date: "",
    photo: "",
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

      const response = await api.get(API_ENDPOINTS.AUTH.ADMIN.PROFILE);

      console.log("Données du profil admin:", response.data);

      // Gérer différents formats de réponse
      let profileData = response.data;

      // Si la réponse a une structure { data: {...} }
      if (response.data?.data) {
        profileData = response.data.data;
      }
      // Si la réponse a une structure { status: "success", data: {...} }
      else if (response.data?.status === "success" && response.data.data) {
        profileData = response.data.data;
      }

      setProfile(profileData);

      // Extraire les numéros de téléphone si nécessaire
      let telephone = profileData.telephone || "";
      let indicatif = "225"; // Par défaut pour la Côte d'Ivoire

      if (telephone) {
        // Si le téléphone commence par l'indicatif
        if (telephone.startsWith("225")) {
          indicatif = "225";
          telephone = telephone.substring(3);
        } else if (telephone.startsWith("+225")) {
          indicatif = "225";
          telephone = telephone.substring(4);
        }
        // Nettoyer le numéro
        telephone = telephone.replace(/\D/g, "");
      }

      // Déterminer nom et prénoms
      let nom = profileData.nom || "";
      let prenoms = profileData.prenoms || "";

      // Si l'API retourne nom_complet mais pas nom/prenoms séparés
      if ((!nom || !prenoms) && profileData.nom_complet) {
        const parts = profileData.nom_complet.split(" ");
        if (parts.length > 0) {
          nom = parts[parts.length - 1]; // Dernier mot = nom
          prenoms = parts.slice(0, -1).join(" "); // Tout sauf dernier = prénoms
        }
      }

      // Formater la date de naissance
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

      // Récupérer l'ID de la civilité
      let civilite_uuid = "";
      if (profileData.civilite?.uuid) {
        civilite_uuid = profileData.civilite.uuid;
      }

      // Pré-remplir le formulaire
      setFormData({
        nom: nom.trim(),
        prenoms: prenoms.trim(),
        email: profileData.email || "",
        telephone: telephone,
        indicatif: indicatif,
        civilite_uuid: civilite_uuid,
        birth_date: birth_date,
        photo: profileData.photo || profileData.avatar || "",
      });

      // Prévisualisation de l'avatar
      if (profileData.avatar || profileData.photo) {
        const avatarUrl = getAvatarUrl(profileData.avatar || profileData.photo);
        setPreviewImage(avatarUrl);
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du profil admin:", err);
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

      // Gérer différents formats de réponse
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

  const getAvatarUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return "";

    // Si c'est déjà une URL complète
    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    // Si c'est un chemin local
    return `${process.env.NEXT_PUBLIC_API_URL}${avatarPath}`;
  };

  const getDefaultAvatar = (nom: string, prenoms: string) => {
    const initials =
      `${prenoms?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=linear-gradient(135deg, #10b981 0%, #059669 100%)&color=fff&size=200&bold=true`;
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
        // 5MB max
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

      // Mettre à jour le champ photo
      setFormData((prev) => ({
        ...prev,
        photo: file.name,
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();

      // Construire le numéro de téléphone complet
      const telephoneComplet = `${formData.indicatif}${formData.telephone}`;

      // Validation des champs obligatoires
      if (!formData.nom.trim()) {
        throw new Error("Le nom est requis");
      }

      if (!formData.prenoms.trim()) {
        throw new Error("Le prénom est requis");
      }

      if (!formData.email.trim()) {
        throw new Error("L'email est requis");
      }

      // Ajouter les champs obligatoires
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

      // Ajouter l'image si une nouvelle a été sélectionnée
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append("photo", fileInputRef.current.files[0]);
      }

      console.log("Données envoyées pour mise à jour:", {
        nom: formData.nom,
        prenoms: formData.prenoms,
        email: formData.email,
        telephone: telephoneComplet,
        civilite_uuid: formData.civilite_uuid,
        birth_date: formData.birth_date,
      });

      const response = await api.put(
        API_ENDPOINTS.AUTH.ADMIN.MODIFIER_PROFILE,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      let responseData = response.data;
      if (response.data?.data) {
        responseData = response.data.data;
      }

      setSuccess("Profil administrateur mis à jour avec succès !");

      // Rafraîchir les données du profil
      setTimeout(() => {
        fetchProfile();
      }, 1000);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil admin:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Obtenir le nom complet pour l'affichage
  const getFullName = () => {
    if (!profile) return "Administrateur";

    if (profile.nom) {
      return profile.nom_complet;
    }

    const fullName = `${formData.prenoms} ${formData.nom}`.trim();
    return fullName || "Administrateur";
  };

  // Obtenir les stats du profil
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
        color: "teal",
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
        color: "emerald",
      },
      {
        title: "Statut du compte",
        value: profile?.is_verified ? "Vérifié ✓" : "En attente",
        icon: "shield-check",
        color: profile?.is_verified ? "green" : "lime",
      },
      {
        title: "Niveau d'accès",
        value: "Administrateur",
        icon: "user-shield",
        color: "forest",
      },
    ];

    return stats;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5 text-center">
                <div className="position-relative">
                  <div
                    className="spinner-border text-success mb-4"
                    style={{ width: "4rem", height: "4rem" }}
                    role="status"
                  >
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <div className="position-absolute top-0 start-50 translate-middle">
                    <i className="fa-solid fa-user-shield fa-2x text-success opacity-75"></i>
                  </div>
                </div>
                <h4 className="fw-bold text-success mb-3">
                  Chargement de votre profil...
                </h4>
                <p className="text-muted fs-5">
                  Nous préparons votre espace administrateur
                </p>
                <div className="progress mt-4" style={{ height: "6px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    style={{ width: "75%" }}
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
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          {/* En-tête avec navigation */}
          <div className="mb-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb p-3 bg-white rounded-4 shadow-sm">
                <li className="breadcrumb-item">
                  <a
                    href="/dashboard-admin"
                    className="text-decoration-none text-success fw-semibold d-flex align-items-center gap-2"
                  >
                    <i className="fa-solid fa-gauge-high fa-lg"></i>
                    <span className="d-none d-md-inline">Tableau de bord</span>
                  </a>
                </li>
                <li className="breadcrumb-item active text-success fw-bold">
                  <i className="fa-solid fa-user-gear me-2"></i>
                  Profil Administrateur
                </li>
              </ol>
            </nav>

            {/* En-tête principal avec gradient vert */}
            <div className="card border-0 shadow-lg overflow-hidden mb-4">
              <div className="card-header bg-gradient-success text-white py-4 border-0">
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
                    >
                      <i className="fa-solid fa-arrow-left me-2"></i>
                      Retour au dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages d'alerte améliorés */}
          {error && (
            <div className="toast-container position-fixed top-0 end-0 p-3">
              <div
                className="toast show"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="toast-header bg-danger text-white">
                  <i className="fa-solid fa-circle-exclamation me-2"></i>
                  <strong className="me-auto">Erreur</strong>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setError(null)}
                  ></button>
                </div>
                <div className="toast-body">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="toast-container position-fixed top-0 end-0 p-3">
              <div
                className="toast show"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <div className="toast-header bg-success text-white">
                  <i className="fa-solid fa-circle-check me-2"></i>
                  <strong className="me-auto">Succès</strong>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSuccess(null)}
                  ></button>
                </div>
                <div className="toast-body">{success}</div>
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
                  >
                    <i className="fa-solid fa-user me-2"></i>
                    Profil
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                  >
                    <i className="fa-solid fa-shield-halved me-2"></i>
                    Sécurité
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "preferences" ? "active" : ""}`}
                    onClick={() => setActiveTab("preferences")}
                  >
                    <i className="fa-solid fa-sliders me-2"></i>
                    Préférences
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === "profile" && (
            <>
              {/* Section de présentation avec stats */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="row align-items-center">
                        <div className="col-md-3 text-center">
                          <div className="position-relative">
                            <img
                              src={
                                previewImage ||
                                getDefaultAvatar(formData.nom, formData.prenoms)
                              }
                              alt="Photo administrateur"
                              className="rounded-circle border border-4 border-white shadow-lg"
                              style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getDefaultAvatar(
                                  formData.nom,
                                  formData.prenoms,
                                );
                              }}
                            />
                            <button
                              onClick={triggerFileInput}
                              className="btn btn-success rounded-circle position-absolute bottom-0 end-0 shadow-lg"
                              style={{
                                width: "48px",
                                height: "48px",
                                border: "4px solid white",
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
                        <div className="col-md-9">
                          <h2 className="fw-bold mb-2">
                            {getFullName()}
                            <span className="badge bg-gradient-success ms-3">
                              <i className="fa-solid fa-star me-1"></i>
                              Administrateur
                            </span>
                          </h2>
                          <p className="text-muted mb-3">
                            <i className="fa-solid fa-envelope me-2"></i>
                            {formData.email}
                          </p>
                          <div className="row">
                            {getProfileStats().map((stat, index) => (
                              <div key={index} className="col-6 col-md-3 mb-3">
                                <div className="d-flex align-items-center">
                                  <div
                                    className={`bg-${stat.color}-subtle rounded-circle p-3 me-3`}
                                  >
                                    <i
                                      className={`fa-solid fa-${stat.icon} text-${stat.color} fa-lg`}
                                    ></i>
                                  </div>
                                  <div>
                                    <div className="small text-muted">
                                      {stat.title}
                                    </div>
                                    <div className="fw-semibold">
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
                        <i className="fa-solid fa-user-edit text-success me-3"></i>
                        Informations personnelles
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                          {/* Prénoms */}
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="text"
                                className="form-control"
                                id="prenoms"
                                name="prenoms"
                                value={formData.prenoms}
                                onChange={handleInputChange}
                                required
                                placeholder=" "
                                disabled={saving}
                              />
                              <label htmlFor="prenoms" className="text-muted">
                                <i className="fa-solid fa-user me-2"></i>
                                Prénom(s)
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>

                          {/* Nom */}
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="text"
                                className="form-control"
                                id="nom"
                                name="nom"
                                value={formData.nom}
                                onChange={handleInputChange}
                                required
                                placeholder=" "
                                disabled={saving}
                              />
                              <label htmlFor="nom" className="text-muted">
                                <i className="fa-solid fa-user-tag me-2"></i>
                                Nom <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>

                          {/* Civilité */}
                          <div className="col-md-6">
                            <div className="form-floating">
                              <select
                                className="form-select"
                                id="civilite_uuid"
                                name="civilite_uuid"
                                value={formData.civilite_uuid}
                                onChange={handleInputChange}
                                disabled={saving}
                              >
                                <option value=""></option>
                                {civilites.map((civilite) => (
                                  <option
                                    key={civilite.uuid}
                                    value={civilite.uuid}
                                  >
                                    {civilite.libelle}
                                  </option>
                                ))}
                              </select>
                              <label
                                htmlFor="civilite_uuid"
                                className="text-muted"
                              >
                                <i className="fa-solid fa-venus-mars me-2"></i>
                                Civilité
                              </label>
                            </div>
                          </div>

                          {/* Date de naissance */}
                          <div className="col-md-6">
                            <div className="form-floating">
                              <input
                                type="date"
                                className="form-control"
                                id="birth_date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleInputChange}
                                disabled={saving}
                                max={new Date().toISOString().split("T")[0]}
                              />
                              <label
                                htmlFor="birth_date"
                                className="text-muted"
                              >
                                <i className="fa-solid fa-cake-candles me-2"></i>
                                Date de naissance
                              </label>
                            </div>
                          </div>

                          {/* Email */}
                          <div className="col-12">
                            <div className="form-floating">
                              <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder=" "
                                disabled={saving}
                              />
                              <label htmlFor="email" className="text-muted">
                                <i className="fa-solid fa-envelope me-2"></i>
                                Adresse email
                                <span className="text-danger">*</span>
                              </label>
                            </div>
                          </div>

                          {/* Téléphone */}
                          <div className="col-12">
                            <div className="form-floating">
                              <div className="input-group">
                                <div className="input-group-text bg-light">
                                  <span className="fw-semibold">+</span>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ maxWidth: "100px" }}
                                  id="indicatif"
                                  name="indicatif"
                                  placeholder="225"
                                  value={formData.indicatif}
                                  onChange={handleInputChange}
                                  maxLength={3}
                                  disabled={saving}
                                />
                                <input
                                  type="tel"
                                  className="form-control"
                                  id="telephone"
                                  name="telephone"
                                  placeholder="07 00 00 00 00"
                                  value={formData.telephone}
                                  onChange={handleInputChange}
                                  disabled={saving}
                                />
                              </div>
                              <label htmlFor="telephone" className="text-muted">
                                <i className="fa-solid fa-phone me-2"></i>
                                Téléphone
                              </label>
                            </div>
                            <div className="form-text">
                              <i className="fa-solid fa-circle-info me-1"></i>
                              Format: indicatif + numéro (ex: +225 0700000000)
                            </div>
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="row mt-5 pt-4 border-top">
                          <div className="col-12">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                              <div className="text-center text-md-start">
                                <p className="text-muted mb-0 small">
                                  <i className="fa-solid fa-circle-info me-2"></i>
                                  Les champs marqués d'un * sont obligatoires
                                </p>
                              </div>
                              <div className="d-flex flex-wrap justify-content-center gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push("/dashboard-admin")
                                  }
                                  className="btn btn-outline-secondary px-4 rounded-pill"
                                  disabled={saving}
                                >
                                  <i className="fa-solid fa-times me-2"></i>
                                  Annuler
                                </button>
                                <button
                                  type="submit"
                                  className="btn btn-success px-4 rounded-pill shadow-sm"
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
                                      Enregistrer les modifications
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                      <i className="fa-solid fa-shield-halved text-warning me-3"></i>
                      Sécurité du compte
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      {/* Section mot de passe */}
                      <div className="col-md-6">
                        <div className="card border-warning h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-start mb-3">
                              <div className="bg-warning-subtle rounded-circle p-3 me-3">
                                <i className="fa-solid fa-key text-warning fa-xl"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-2">
                                  Gestion du mot de passe
                                </h6>
                                <p className="text-muted small mb-0">
                                  Pour des raisons de sécurité, la modification
                                  du mot de passe nécessite une procédure
                                  spécifique.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                router.push("/auth/admin/forgot-password")
                              }
                              className="btn btn-outline-warning w-100"
                            >
                              <i className="fa-solid fa-key me-2"></i>
                              Réinitialiser le mot de passe
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Section authentification à deux facteurs */}
                      <div className="col-md-6">
                        <div className="card border-success h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-start mb-3">
                              <div className="bg-success-subtle rounded-circle p-3 me-3">
                                <i className="fa-solid fa-mobile-screen text-success fa-xl"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-2">
                                  Authentification à deux facteurs
                                </h6>
                                <p className="text-muted small mb-0">
                                  Ajoutez une couche de sécurité supplémentaire
                                  à votre compte.
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

                      {/* Section sessions actives */}
                      <div className="col-12">
                        <div className="card border-success">
                          <div className="card-header bg-success-subtle">
                            <h6 className="fw-bold mb-0 text-success">
                              <i className="fa-solid fa-computer-mouse me-2"></i>
                              Sessions actives
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div>
                                <div className="fw-semibold">
                                  Session actuelle
                                </div>
                                <small className="text-muted">
                                  Navigateur Chrome • Abidjan, CI
                                </small>
                              </div>
                              <span className="badge bg-success">
                                <i className="fa-solid fa-circle-check me-1"></i>
                                Actif maintenant
                              </span>
                            </div>
                            <button className="btn btn-outline-danger w-100">
                              <i className="fa-solid fa-sign-out me-2"></i>
                              Déconnecter toutes les autres sessions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white py-3 border-bottom">
                    <h5 className="fw-bold mb-0 d-flex align-items-center">
                      <i className="fa-solid fa-sliders text-success me-3"></i>
                      Préférences du compte
                    </h5>
                  </div>
                  <div className="card-body p-4">
                    <div className="row g-4">
                      {/* Langue */}
                      <div className="col-md-6">
                        <div className="form-floating">
                          <select className="form-select" id="language">
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                          </select>
                          <label htmlFor="language" className="text-muted">
                            <i className="fa-solid fa-language me-2"></i>
                            Langue préférée
                          </label>
                        </div>
                      </div>

                      {/* Fuseau horaire */}
                      <div className="col-md-6">
                        <div className="form-floating">
                          <select className="form-select" id="timezone">
                            <option value="Africa/Abidjan">
                              Abidjan (UTC+0)
                            </option>
                            <option value="Europe/Paris">Paris (UTC+1)</option>
                            <option value="America/New_York">
                              New York (UTC-5)
                            </option>
                          </select>
                          <label htmlFor="timezone" className="text-muted">
                            <i className="fa-solid fa-clock me-2"></i>
                            Fuseau horaire
                          </label>
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className="col-12">
                        <div className="card border-success">
                          <div className="card-header bg-success-subtle">
                            <h6 className="fw-bold mb-0 text-success">
                              <i className="fa-solid fa-bell me-2"></i>
                              Préférences de notifications
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="emailNotifications"
                                  defaultChecked
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="emailNotifications"
                                >
                                  Notifications par email
                                </label>
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="pushNotifications"
                                  defaultChecked
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="pushNotifications"
                                >
                                  Notifications push
                                </label>
                              </div>
                            </div>
                            <div className="mb-0">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="smsNotifications"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="smsNotifications"
                                >
                                  Notifications par SMS
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bouton de sauvegarde */}
                      <div className="col-12">
                        <div className="d-flex justify-content-end">
                          <button className="btn btn-success px-4 rounded-pill shadow-sm">
                            <i className="fa-solid fa-save me-2"></i>
                            Sauvegarder les préférences
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer avec informations */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm bg-success-subtle">
                <div className="card-body text-center p-4">
                  <div className="row align-items-center">
                    <div className="col-md-8 text-md-start">
                      <h6 className="fw-bold text-success mb-2">
                        <i className="fa-solid fa-circle-info me-2"></i>
                        Support Administrateur
                      </h6>
                      <p className="text-muted mb-0 small">
                        Pour toute assistance technique concernant votre compte
                        administrateur, notre équipe de support est disponible
                        24h/24 et 7j/7.
                      </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <a
                        href="mailto:support@admin.com"
                        className="btn btn-outline-success"
                      >
                        <i className="fa-solid fa-envelope me-2"></i>
                        Contact Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Définition des couleurs vertes personnalisées */
        .bg-gradient-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .text-teal {
          color: #0d9488 !important;
        }

        .bg-teal-subtle {
          background-color: #f0fdfa !important;
        }

        .text-emerald {
          color: #059669 !important;
        }

        .bg-emerald-subtle {
          background-color: #f0fdf4 !important;
        }

        .text-forest {
          color: #166534 !important;
        }

        .bg-forest-subtle {
          background-color: #f0fdf2 !important;
        }

        .text-lime {
          color: #65a30d !important;
        }

        .bg-lime-subtle {
          background-color: #f7fee7 !important;
        }

        .bg-success-subtle {
          background-color: #f0fdf4 !important;
        }

        .card {
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .nav-pills .nav-link {
          border-radius: 50px;
          padding: 12px 24px;
          transition: all 0.3s ease;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .nav-pills .nav-link.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          color: white;
        }

        .nav-pills .nav-link:not(.active):hover {
          background-color: rgba(16, 185, 129, 0.1);
          border-color: #10b981;
          color: #059669;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 0.25rem rgba(16, 185, 129, 0.25);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          font-weight: 500;
        }

        .btn-success:hover {
          background: linear-gradient(135deg, #0da271 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-outline-success {
          color: #059669;
          border-color: #10b981;
        }

        .btn-outline-success:hover {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-color: transparent;
        }

        .toast {
          border-radius: 10px;
          border: none;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }

        .progress-bar {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .breadcrumb {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }

        .breadcrumb-item.active {
          color: #059669;
          font-weight: 600;
        }

        .form-floating > .form-control:focus ~ label,
        .form-floating > .form-control:not(:placeholder-shown) ~ label {
          color: #059669;
        }

        .badge {
          padding: 8px 16px;
          font-weight: 500;
          border-radius: 50px;
        }

        .badge.bg-gradient-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .form-check-input:checked {
          background-color: #10b981;
          border-color: #10b981;
        }

        .form-switch .form-check-input:focus {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%2310b981'/%3e%3c/svg%3e");
        }

        .form-switch .form-check-input:checked {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
        }

        /* Animation pour le spinner */
        .spinner-border.text-success {
          border-color: #10b981;
          border-right-color: transparent;
        }

        /* Animation hover pour les cartes */
        .card.border-success:hover {
          border-color: #10b981 !important;
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.15) !important;
        }

        /* Style pour les icônes vertes */
        .fa-solid.text-success {
          color: #059669 !important;
        }

        /* Style pour les bordures vertes */
        .border-success {
          border-color: #d1fae5 !important;
        }

        /* Style pour les en-têtes de carte */
        .card-header.bg-success-subtle {
          background: linear-gradient(
            135deg,
            rgba(16, 185, 129, 0.1) 0%,
            rgba(5, 150, 105, 0.1) 100%
          );
          border-bottom: 2px solid #d1fae5;
        }
      `}</style>
    </div>
  );
}
