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

      console.log("Données du profil:", response.data);

      if (response.data?.data) {
        const profileData = response.data.data;
        setProfile(profileData);

        // Extraire les numéros de téléphone si nécessaire
        let telephone = profileData.telephone || "";
        let indicatif = "225"; // Par défaut pour la Côte d'Ivoire

        if (telephone) {
          // Si le téléphone commence par l'indicatif
          if (telephone.startsWith("225")) {
            indicatif = "225";
            telephone = telephone.substring(3);
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

        // Pré-remplir le formulaire
        setFormData({
          nom: nom,
          prenoms: prenoms,
          email: profileData.email || "",
          telephone: telephone,
          indicatif: indicatif,
          civilite_uuid: profileData.civilite?.uuid || "",
          birth_date: profileData.birth_date
            ? new Date(profileData.birth_date).toISOString().split("T")[0]
            : "",
          photo: profileData.photo || "",
        });

        // Prévisualisation de l'avatar
        if (profileData.avatar) {
          setPreviewImage(getAvatarUrl(profileData.avatar));
        } else if (profileData.photo) {
          setPreviewImage(getAvatarUrl(profileData.photo));
        }
      } else {
        // Si pas de données dans data, utiliser la réponse directe
        setProfile(response.data || null);
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération du profil:", err);
      setError(
        err.response?.data?.message || "Impossible de charger le profil",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCivilites = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CIVILITES.ACTIVES);
      if (response.data?.data) {
        setCivilites(response.data.data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des civilités:", err);
    }
  };

  const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return "";
    if (avatarPath.includes("http://localhost:3005/api/files/")) {
      return avatarPath;
    }
    return `http://localhost:3005/api/files/${avatarPath}`;
  };

  const getDefaultAvatar = (nom: string, prenoms: string) => {
    const initials =
      `${prenoms?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=16a34a&color=fff&size=150`;
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

      // Ajouter les champs obligatoires
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("prenoms", formData.prenoms);
      formDataToSend.append("email", formData.email);

      if (telephoneComplet) {
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
      } else if (formData.photo) {
        // Si on garde l'ancienne photo
        formDataToSend.append("photo", formData.photo);
      }

      console.log("Données envoyées:", {
        nom: formData.nom,
        prenoms: formData.prenoms,
        email: formData.email,
        telephone: telephoneComplet,
        civilite_uuid: formData.civilite_uuid,
        birth_date: formData.birth_date,
        photo: formData.photo,
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

      if (response.data?.data) {
        setSuccess("Profil mis à jour avec succès !");
        // Rafraîchir les données du profil
        setTimeout(() => {
          fetchProfile();
        }, 1000);

        // Rediriger après 3 secondes
        setTimeout(() => {
          router.push("/dashboard-admin");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Obtenir le nom complet pour l'affichage
  const getFullName = () => {
    if (!profile) return "";

    if (profile.nom_complet) {
      return profile.nom_complet;
    }

    return `${formData.prenoms} ${formData.nom}`.trim();
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-success"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted fs-5">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 fw-bold mb-1 text-success">
                Modifier mon profil
              </h1>
              <p className="text-muted mb-0">
                Gérez vos informations personnelles et votre photo de profil
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard-admin")}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show d-flex align-items-center"
          role="alert"
        >
          <i className="fa-solid fa-exclamation-circle fa-lg me-3"></i>
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
          <i className="fa-solid fa-check-circle fa-lg me-3"></i>
          <div className="flex-grow-1">{success}</div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row">
        <div className="col-lg-4">
          {/* Carte photo de profil */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body text-center p-4">
              <div className="position-relative d-inline-block mb-4">
                <div className="position-relative">
                  <img
                    src={
                      previewImage ||
                      getDefaultAvatar(formData.nom, formData.prenoms)
                    }
                    alt="Photo de profil"
                    className="rounded-circle mb-3 border border-4 border-success shadow"
                    style={{
                      width: "180px",
                      height: "180px",
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
                    className="btn btn-primary rounded-circle position-absolute bottom-0 end-0 shadow"
                    style={{
                      width: "48px",
                      height: "48px",
                      border: "3px solid white",
                    }}
                    title="Changer la photo"
                    type="button"
                  >
                    <i className="fa-solid fa-camera fa-lg"></i>
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

              <h4 className="fw-bold mb-2">{getFullName()}</h4>
              <p className="text-muted mb-3">
                <i className="fa-solid fa-envelope me-2"></i>
                {formData.email}
              </p>
              {profile?.role_uuid && (
                <span className="badge bg-success fs-6 px-3 py-2 mb-3">
                  <i className="fa-solid fa-user-shield me-2"></i>
                  Administrateur
                </span>
              )}

              <div className="mt-4">
                <div className="alert alert-light border">
                  <p className="text-muted mb-0 small">
                    <i className="fa-solid fa-info-circle me-2"></i>
                    Formats acceptés : JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Carte informations de compte */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4 d-flex align-items-center">
                <i className="fa-solid fa-shield-alt me-3 text-primary"></i>
                Informations de compte
              </h5>

              <div className="mb-4">
                <label className="form-label small text-muted fw-semibold">
                  ID Utilisateur
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fa-solid fa-id-card"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={profile?.uuid || "Non disponible"}
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-muted fw-semibold">
                  Statut du compte
                </label>
                <div className="d-flex align-items-center">
                  {profile?.is_verified ? (
                    <>
                      <span className="badge bg-success d-flex align-items-center me-3 px-3 py-2">
                        <i className="fa-solid fa-check-circle me-2"></i>
                        Vérifié
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="badge bg-warning d-flex align-items-center me-3 px-3 py-2">
                        <i className="fa-solid fa-exclamation-triangle me-2"></i>
                        Non vérifié
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small text-muted fw-semibold">
                  Date d'inscription
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fa-solid fa-calendar-plus"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={
                      profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "Non disponible"
                    }
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted fw-semibold">
                  Dernière mise à jour
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={
                      profile?.updated_at
                        ? new Date(profile.updated_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "Non disponible"
                    }
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {/* Formulaire de modification */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fa-solid fa-user-edit fa-lg text-primary"></i>
                </div>
                <div>
                  <h5 className="card-title fw-bold mb-1">
                    Informations personnelles
                  </h5>
                  <p className="text-muted mb-0">
                    Mettez à jour vos informations de contact
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label htmlFor="prenoms" className="form-label fw-semibold">
                      Prénom(s) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fa-solid fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="prenoms"
                        name="prenoms"
                        value={formData.prenoms}
                        onChange={handleInputChange}
                        required
                        placeholder="Vos prénoms"
                      />
                    </div>
                    <div className="form-text">
                      Saisissez vos prénoms complets
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label htmlFor="nom" className="form-label fw-semibold">
                      Nom <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fa-solid fa-user-tag"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                        placeholder="Votre nom de famille"
                      />
                    </div>
                    <div className="form-text">
                      Saisissez votre nom de famille
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label
                      htmlFor="civilite_uuid"
                      className="form-label fw-semibold"
                    >
                      Civilité
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fa-solid fa-user-tie"></i>
                      </span>
                      <select
                        className="form-select"
                        id="civilite_uuid"
                        name="civilite_uuid"
                        value={formData.civilite_uuid}
                        onChange={handleInputChange}
                      >
                        <option value="">Sélectionner une civilité</option>
                        {civilites.map((civilite) => (
                          <option key={civilite.uuid} value={civilite.uuid}>
                            {civilite.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label
                      htmlFor="birth_date"
                      className="form-label fw-semibold"
                    >
                      Date de naissance
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fa-solid fa-cake-candles"></i>
                      </span>
                      <input
                        type="date"
                        className="form-control"
                        id="birth_date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Adresse email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fa-solid fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div className="form-text">
                      Cette adresse sera utilisée pour la connexion
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <label
                      htmlFor="telephone"
                      className="form-label fw-semibold"
                    >
                      Téléphone
                    </label>
                    <div className="input-group">
                      <div className="input-group-text bg-light">
                        <span className="fw-semibold">+</span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        id="indicatif"
                        name="indicatif"
                        placeholder="225"
                        value={formData.indicatif}
                        onChange={handleInputChange}
                        maxLength={3}
                        style={{ maxWidth: "80px" }}
                      />
                      <input
                        type="tel"
                        className="form-control"
                        id="telephone"
                        name="telephone"
                        placeholder="0700000000"
                        value={formData.telephone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-text">
                      Format: indicatif + numéro (ex: 225 0700000000)
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-0 small">
                        <i className="fa-solid fa-circle-info me-2"></i>
                        Tous les champs marqués d'une astérisque (*) sont
                        obligatoires
                      </p>
                    </div>
                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4 py-2"
                        onClick={() => router.push("/dashboard-admin")}
                        disabled={saving}
                      >
                        <i className="fa-solid fa-times me-2"></i>
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success px-4 py-2 shadow-sm"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Enregistrement en cours...
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
              </form>
            </div>
          </div>

          {/* Section sécurité */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <i className="fa-solid fa-lock fa-lg text-warning"></i>
                </div>
                <div>
                  <h5 className="card-title fw-bold mb-1">
                    Sécurité du compte
                  </h5>
                  <p className="text-muted mb-0">
                    Protégez votre compte et vos données
                  </p>
                </div>
              </div>

              <div className="alert alert-warning border-start border-warning border-5">
                <div className="d-flex align-items-start">
                  <i className="fa-solid fa-key fa-2x me-3 mt-1 text-warning"></i>
                  <div>
                    <h6 className="alert-heading fw-bold mb-2">
                      Gestion du mot de passe
                    </h6>
                    <p className="mb-0">
                      Pour des raisons de sécurité, la modification du mot de
                      passe se fait via la fonction "Mot de passe oublié" depuis
                      la page de connexion. Pour toute assistance, contactez
                      notre équipe de support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  onClick={() => router.push("/forgot-password")}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                >
                  <i className="fa-solid fa-key"></i>
                  Réinitialiser le mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
