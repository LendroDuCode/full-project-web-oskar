// app/(back-office)/dashboard-admin/villes/components/modals/CreateVilleModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCity,
  faSave,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faMapMarkerAlt,
  faGlobe,
  faFlag,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import colors from "@/app/shared/constants/colors";
import { User } from "../../../utilisateurs/types/user.types";

// Types pour les pays
// Types pour les villes

// Type principal Ville
interface Ville {
  // Identifiant unique
  uuid: string;
  
  // Informations principales
  nom: string;
  code_postal: string;
  code_insee?: string;
  description?: string;
  
  // Géographie
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  densite?: number;
  
  // Relations
  pays_uuid: string;
  departement_uuid?: string;
  region_uuid?: string;
  
  // Statut
  statut: "actif" | "inactif" | "archive";
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  
  // Démographie
  annee_recensement?: number;
  evolution_population?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  esperance_vie?: number;
  
  // Économie
  nombre_entreprises?: number;
  taux_chomage?: number;
  revenu_median?: number;
  principales_activites?: string[];
  
  // Infrastructure
  nombre_ecoles?: number;
  nombre_hopitaux?: number;
  nombre_transports?: number;
  reseau_transport?: {
    bus?: boolean;
    metro?: boolean;
    tram?: boolean;
    train?: boolean;
    aeroport?: boolean;
  };
  
  // Climat
  climat?: {
    type?: string;
    temperature_moyenne?: number;
    precipitation_moyenne?: number;
    ensoleillement_moyen?: number;
  };
  
  // Tourisme
  sites_touristiques?: string[];
  nombre_hotels?: number;
  capacite_hebergement?: number;
  frequentation_touristique?: number;
  
  // Culture
  nombre_musees?: number;
  nombre_theatres?: number;
  evenements_culturels?: string[];
  
  // Environnement
  espaces_verts?: number;
  taux_forestation?: number;
  qualite_air?: number;
  
  // Relations (optionnelles selon le contexte)
  pays?: Pays;
  departement?: Departement;
  region?: Region;
  quartiers?: Quartier[];
  adresses?: Adresse[];
  utilisateurs?: User[];
  
  // Codes standards
  code_postal_principal?: string;
  codes_postaux?: string[];
  zone_horaire?: string;
  code_telephonique_local?: string;
  
  // Métadonnées
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  validated_at?: string;
  validated_by?: string;
  
  // Historique
  anciens_noms?: {
    nom: string;
    periode: string;
  }[];
  date_fondation?: string;
  evenements_historiques?: {
    date: string;
    evenement: string;
  }[];
}

// Type pour les formulaires
interface VilleFormData {
  nom: string;
  code_postal: string;
  pays_uuid: string;
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  statut?: "actif" | "inactif";
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  annee_recensement?: number;
  principales_activites?: string[];
  sites_touristiques?: string[];
}

// Type pour la création de ville
interface CreateVilleData {
  nom: string;
  code_postal: string;
  pays_uuid: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  statut?: "actif" | "inactif";
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
}

// Type pour la mise à jour de ville
interface UpdateVilleData {
  nom?: string;
  code_postal?: string;
  pays_uuid?: string;
  departement_uuid?: string;
  region_uuid?: string;
  code_insee?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  superficie?: number;
  population?: number;
  densite?: number;
  statut?: "actif" | "inactif" | "archive";
  est_capitale?: boolean;
  est_capitale_region?: boolean;
  est_capitale_departement?: boolean;
  annee_recensement?: number;
  evolution_population?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  nombre_entreprises?: number;
  taux_chomage?: number;
  revenu_median?: number;
  principales_activites?: string[];
  nombre_ecoles?: number;
  nombre_hopitaux?: number;
  sites_touristiques?: string[];
  espaces_verts?: number;
  qualite_air?: number;
  codes_postaux?: string[];
  zone_horaire?: string;
}

// Type pour la réponse API
interface ApiResponseVille {
  success: boolean;
  message: string;
  data: Ville | Ville[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Type pour les filtres de recherche
interface VilleFilterType {
  search?: string;
  pays_uuid?: string;
  departement_uuid?: string;
  region_uuid?: string;
  statut?: "actif" | "inactif" | "archive" | "tous";
  est_capitale?: boolean;
  avec_code_postal?: boolean;
  avec_coordonnees?: boolean;
  population_min?: number;
  population_max?: number;
  orderBy?: keyof Ville | 'pays.nom' | 'departement.nom' | 'population';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Type pour les statistiques villes
interface VilleStatsType {
  total: number;
  par_pays: Record<string, number>;
  par_statut: {
    actif: number;
    inactif: number;
    archive: number;
  };
  avec_coordonnees: number;
  capitales: number;
  population_totale: number;
  densite_moyenne: number;
  villes_plus_peuplees: Ville[];
}

// Type pour les options de sélection
interface VilleOptionType {
  value: string;
  label: string;
  code_postal: string;
  pays_uuid: string;
  pays_nom?: string;
  population?: number;
  disabled?: boolean;
}

// Type pour l'export ville
interface VilleExportData {
  uuid: string;
  nom: string;
  code_postal: string;
  code_insee: string;
  pays_nom: string;
  pays_code: string;
  region_nom: string;
  departement_nom: string;
  latitude: number;
  longitude: number;
  altitude: number;
  superficie: number;
  population: number;
  densite: number;
  statut: string;
  est_capitale: boolean;
  annee_recensement: number;
  created_at: string;
  updated_at: string;
}

// Type pour la recherche de ville
interface VilleSearchResult {
  uuid: string;
  nom: string;
  code_postal: string;
  pays: {
    uuid: string;
    nom: string;
    code: string;
  };
  departement?: {
    uuid: string;
    nom: string;
    code: string;
  };
  region?: {
    uuid: string;
    nom: string;
    code: string;
  };
  latitude?: number;
  longitude?: number;
  population?: number;
  distance?: number; // Pour les recherches géolocalisées
}

// Type pour les coordonnées géographiques
interface VilleCoordinates {
  uuid: string;
  nom: string;
  code_postal: string;
  latitude: number;
  longitude: number;
  pays_nom: string;
}

// Type pour les quartiers
interface Quartier {
  uuid: string;
  nom: string;
  ville_uuid: string;
  description?: string;
  type?: string;
  population?: number;
  superficie?: number;
  latitude?: number;
  longitude?: number;
  statut: "actif" | "inactif";
  created_at?: string;
  updated_at?: string;
}

// Type pour les adresses
interface Adresse {
  uuid: string;
  rue: string;
  numero?: string;
  complement?: string;
  code_postal: string;
  ville_uuid: string;
  pays_uuid: string;
  latitude?: number;
  longitude?: number;
  type?: "residence" | "bureau" | "commercial" | "autre";
  statut: "actif" | "inactif";
  created_at?: string;
  updated_at?: string;
}

// Type pour les régions
interface Region {
  uuid: string;
  nom: string;
  code: string;
  pays_uuid: string;
  description?: string;
  superficie?: number;
  population?: number;
  capitale_region_uuid?: string;
  statut: "actif" | "inactif";
  created_at?: string;
  updated_at?: string;
  pays?: Pays;
  villes?: Ville[];
  departements?: Departement[];
}

// Type pour les départements
interface Departement {
  uuid: string;
  nom: string;
  code: string;
  region_uuid?: string;
  pays_uuid: string;
  description?: string;
  superficie?: number;
  population?: number;
  prefecture_uuid?: string;
  statut: "actif" | "inactif";
  created_at?: string;
  updated_at?: string;
  region?: Region;
  pays?: Pays;
  villes?: Ville[];
}
// Type principal Pays
interface Pays {
  // Identifiant unique
  uuid: string;
  code: string;
  
  // Informations principales
  nom: string;
  nom_complet?: string;
  nom_local?: string;
  description?: string;
  
  // Drapeau et symboles
  code_drapeau?: string;
  emoji_drapeau?: string;
  devise?: string;
  monnaie_code?: string;
  monnaie_symbole?: string;
  
  // Géographie
  continent?: string;
  sous_continent?: string;
  region?: string;
  sous_region?: string;
  capitale?: string;
  superficie?: number;
  population?: number;
  densite?: number;
  
  // Langues
  langues_officielles?: string[];
  langues_parlees?: string[];
  
  // Indicatifs
  indicatif_telephonique?: string;
  tld?: string;
  
  // Fuseau horaire
  fuseau_horaire?: string;
  utc_offset?: string;
  
  // Économie
  pib?: number;
  pib_par_habitant?: number;
  croissance_pib?: number;
  inflation?: number;
  chomage?: number;
  
  // Démographie
  esperance_vie?: number;
  taux_natalite?: number;
  taux_mortalite?: number;
  taux_migration?: number;
  
  // Indices
  indice_developpement_humain?: number;
  indice_gini?: number;
  indice_bonheur?: number;
  
  // Statut
  statut: "actif" | "inactif" | "archive";
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;
  
  // Classifications
  organisation_mondiale_commerce?: boolean;
  union_europeenne?: boolean;
  zone_schengen?: boolean;
  zone_euro?: boolean;
  commonwealth?: boolean;
  francophonie?: boolean;
  
  // Codes standards
  code_iso2?: string;
  code_iso3?: string;
  code_iso_numerique?: string;
  code_fips?: string;
  code_ioc?: string;
  code_cctld?: string;
  
  // Localisation
  latitude?: number;
  longitude?: number;
  
  // Relations (optionnelles selon le contexte)
  villes?: Ville[];
  regions?: Region[];
  departements?: Departement[];
  
  // Métadonnées
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Type pour les formulaires
interface PaysFormData {
  nom: string;
  code: string;
  nom_complet?: string;
  nom_local?: string;
  description?: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
  devise?: string;
  monnaie_code?: string;
  monnaie_symbole?: string;
  continent?: string;
  sous_continent?: string;
  region?: string;
  sous_region?: string;
  capitale?: string;
  superficie?: number;
  population?: number;
  langues_officielles?: string[];
  indicatif_telephonique?: string;
  tld?: string;
  fuseau_horaire?: string;
  statut?: "actif" | "inactif";
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;
  latitude?: number;
  longitude?: number;
  code_iso2?: string;
  code_iso3?: string;
}

// Type pour la création de pays
interface CreatePaysData {
  nom: string;
  code: string;
  nom_complet?: string;
  code_drapeau?: string;
  continent?: string;
  capitale?: string;
  statut?: "actif" | "inactif";
  description?: string;
}

// Type pour la mise à jour de pays
interface UpdatePaysData {
  nom?: string;
  code?: string;
  nom_complet?: string;
  nom_local?: string;
  description?: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
  devise?: string;
  monnaie_code?: string;
  monnaie_symbole?: string;
  continent?: string;
  sous_continent?: string;
  region?: string;
  sous_region?: string;
  capitale?: string;
  superficie?: number;
  population?: number;
  densite?: number;
  langues_officielles?: string[];
  indicatif_telephonique?: string;
  tld?: string;
  fuseau_horaire?: string;
  utc_offset?: string;
  statut?: "actif" | "inactif" | "archive";
  est_soumis_tva?: boolean;
  taux_tva_standard?: number;
  latitude?: number;
  longitude?: number;
  code_iso2?: string;
  code_iso3?: string;
}

// Type pour la réponse API
interface ApiResponsePays {
  success: boolean;
  message: string;
  data: Pays | Pays[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Type pour les filtres de recherche
interface PaysFilterType {
  search?: string;
  continent?: string;
  region?: string;
  sous_region?: string;
  statut?: "actif" | "inactif" | "archive" | "tous";
  avec_villes?: boolean;
  avec_regions?: boolean;
  orderBy?: keyof Pays | 'nombre_villes';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Type pour les statistiques pays
interface PaysStatsType {
  total: number;
  par_continent: Record<string, number>;
  par_statut: {
    actif: number;
    inactif: number;
    archive: number;
  };
  avec_capitale: number;
  avec_coordonnees: number;
  densite_moyenne: number;
  superficie_totale: number;
  population_totale: number;
}

// Type pour les options de sélection
interface PaysOptionType {
  value: string;
  label: string;
  code: string;
  code_drapeau?: string;
  emoji_drapeau?: string;
  continent?: string;
  disabled?: boolean;
}

// Type pour l'export pays
interface PaysExportData {
  uuid: string;
  nom: string;
  code: string;
  nom_complet: string;
  continent: string;
  region: string;
  sous_region: string;
  capitale: string;
  superficie: number;
  population: number;
  densite: number;
  indicatif_telephonique: string;
  tld: string;
  devise: string;
  monnaie_code: string;
  statut: string;
  nombre_villes: number;
  created_at: string;
  updated_at: string;
}

// Type pour les drapeaux pays
interface PaysDrapeauType {
  code: string;
  nom: string;
  emoji: string;
  unicode: string;
  image_url?: string;
}

// Type pour la carte pays
interface PaysCarteType {
  uuid: string;
  nom: string;
  code: string;
  svg_path?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  }[];
  bounding_box?: {
    nord: number;
    sud: number;
    est: number;
    ouest: number;
  };
}

// Type pour les relations internationales
interface PaysRelationInternationale {
  pays_uuid: string;
  pays_partenaire_uuid: string;
  type_relation: 'diplomatique' | 'commerciale' | 'culturelle' | 'militaire' | 'autre';
  date_debut: string;
  date_fin?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
// Types
interface FormData {
  nom: string;
  code_postal: string;
  pays_uuid: string;
  statut: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface CreateVilleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateVilleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVilleModalProps) {
  // États du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    code_postal: "",
    pays_uuid: "",
    statut: "actif",
    description: "",
  });

  // États pour les pays
  const [pays, setPays] = useState<Pays[]>([]);
  const [loadingPays, setLoadingPays] = useState(false);

  // États de chargement et erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Styles personnalisés
  const styles = {
    modalHeader: {
      background: `linear-gradient(135deg, ${colors.oskar.purple} 0%, ${colors.oskar.purpleHover} 100%)`,
      borderBottom: `3px solid ${colors.oskar.blue}`,
    },
    sectionHeader: {
      background: colors.oskar.lightGrey,
      borderLeft: `4px solid ${colors.oskar.purple}`,
    },
    primaryButton: {
      background: colors.oskar.purple,
      borderColor: colors.oskar.purple,
    },
    primaryButtonHover: {
      background: colors.oskar.purpleHover,
      borderColor: colors.oskar.purpleHover,
    },
    secondaryButton: {
      background: "white",
      color: colors.oskar.purple,
      borderColor: colors.oskar.purple,
    },
    secondaryButtonHover: {
      background: colors.oskar.lightGrey,
      color: colors.oskar.purpleHover,
      borderColor: colors.oskar.purpleHover,
    },
  };

  // Fonction pour charger les pays
  const fetchPays = useCallback(async () => {
    try {
      setLoadingPays(true);
      setError(null);

      // Construire les paramètres de requête
      const params = new URLSearchParams({
        limit: "100", // Charger plus de pays pour les listes déroulantes
        statut: "actif", // Ne charger que les pays actifs
        sort: "nom", // Trier par nom
      });

      const endpoint = `${API_ENDPOINTS.PAYS.LIST}?${params.toString()}`;
      console.log("📡 Chargement des pays:", endpoint);

      const response = await api.get(endpoint);

      if (response.data && Array.isArray(response.data.data)) {
        setPays(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback pour les APIs qui retournent directement un tableau
        setPays(response.data);
      } else {
        console.error("❌ Format de réponse inattendu pour les pays:", response.data);
        setPays([]);
      }
    } catch (err: any) {
      console.error("❌ Erreur lors du chargement des pays:", err);
      
      let errorMessage = "Erreur lors du chargement des pays";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPays([]);
    } finally {
      setLoadingPays(false);
    }
  }, []);

  // Charger les pays quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchPays();
    }
  }, [isOpen, fetchPays]);

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      nom: "",
      code_postal: "",
      pays_uuid: "",
      statut: "actif",
      description: "",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = "Le nom de la ville est obligatoire";
    } else if (formData.nom.length < 2) {
      errors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.code_postal.trim()) {
      errors.code_postal = "Le code postal est obligatoire";
    }

    if (!formData.pays_uuid) {
      errors.pays_uuid = "Le pays est obligatoire";
    }

    if (!formData.statut) {
      errors.statut = "Le statut est obligatoire";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion des changements de formulaire
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "latitude" || name === "longitude"
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));

    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Préparer les données pour l'API
      const villeData = {
        nom: formData.nom.trim(),
        code_postal: formData.code_postal.trim(),
        pays_uuid: formData.pays_uuid,
        statut: formData.statut,
        description: formData.description?.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      // Appel à l'API
      await api.post(API_ENDPOINTS.VILLES.CREATE, villeData);

      setSuccessMessage("Ville créée avec succès !");

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        code_postal: "",
        pays_uuid: "",
        statut: "actif",
        description: "",
      });

      // Appeler le callback de succès
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      let errorMessage = "Erreur lors de la création de la ville";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (err.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (err.response?.status === 409) {
        errorMessage = "Une ville avec ce nom ou code postal existe déjà.";
      } else if (err.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const handleReset = () => {
    setFormData({
      nom: "",
      code_postal: "",
      pays_uuid: "",
      statut: "actif",
      description: "",
    });
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Fermer la modal
  const handleClose = () => {
    if (loading) return;

    if (formData.nom || formData.code_postal || formData.pays_uuid) {
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

  // Si la modal n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }}
      role="dialog"
      aria-labelledby="createVilleModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          {/* En-tête de la modal */}
          <div
            className="modal-header text-white border-0 rounded-top-3"
            style={styles.modalHeader}
          >
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                <FontAwesomeIcon icon={faCity} className="fs-5" />
              </div>
              <div>
                <h5
                  className="modal-title mb-0 fw-bold"
                  id="createVilleModalLabel"
                >
                  Créer une Nouvelle Ville
                </h5>
                <p className="mb-0 opacity-75 fs-14">
                  Remplissez les informations pour ajouter une nouvelle ville
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
            ></button>
          </div>

          {/* Corps de la modal */}
          <div className="modal-body py-4">
            {/* Messages d'alerte */}
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
                    aria-label="Fermer l'alerte"
                  ></button>
                </div>
              </div>
            )}

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
                    aria-label="Fermer l'alerte"
                  ></button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: "12px" }}
              >
                <div
                  className="card-header border-0 py-3"
                  style={styles.sectionHeader}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle p-2 me-3"
                      style={{ backgroundColor: `${colors.oskar.purple}15` }}
                    >
                      <FontAwesomeIcon
                        icon={faCity}
                        style={{ color: colors.oskar.purple }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold"
                        style={{ color: colors.oskar.purple }}
                      >
                        Informations de la Ville
                      </h6>
                      <small className="text-muted">
                        Les champs marqués d'un * sont obligatoires
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {/* Nom de la ville */}
                    <div className="col-md-6">
                      <label htmlFor="nom" className="form-label fw-semibold">
                        <FontAwesomeIcon icon={faCity} className="me-2" />
                        Nom de la ville <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faCity}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          className={`form-control border-start-0 ps-0 ${validationErrors.nom ? "is-invalid" : ""}`}
                          placeholder="Ex: Paris, Lyon, Marseille..."
                          value={formData.nom}
                          onChange={handleChange}
                          disabled={loading}
                          aria-describedby={
                            validationErrors.nom ? "nom-error" : undefined
                          }
                        />
                      </div>
                      {validationErrors.nom && (
                        <div
                          id="nom-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.nom}
                        </div>
                      )}
                      <small className="text-muted">
                        Nom complet de la ville
                      </small>
                    </div>

                    {/* Code postal */}
                    <div className="col-md-3">
                      <label
                        htmlFor="code_postal"
                        className="form-label fw-semibold"
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="me-2"
                        />
                        Code postal <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-muted"
                          />
                        </span>
                        <input
                          type="text"
                          id="code_postal"
                          name="code_postal"
                          className={`form-control border-start-0 ps-0 ${validationErrors.code_postal ? "is-invalid" : ""}`}
                          placeholder="Ex: 75000, 69000"
                          value={formData.code_postal}
                          onChange={handleChange}
                          disabled={loading}
                          aria-describedby={
                            validationErrors.code_postal
                              ? "code-postal-error"
                              : undefined
                          }
                        />
                      </div>
                      {validationErrors.code_postal && (
                        <div
                          id="code-postal-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.code_postal}
                        </div>
                      )}
                      <small className="text-muted">
                        Code postal de la ville
                      </small>
                    </div>

                    {/* Statut */}
                    <div className="col-md-3">
                      <label
                        htmlFor="statut"
                        className="form-label fw-semibold"
                      >
                        <FontAwesomeIcon icon={faFlag} className="me-2" />
                        Statut <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faFlag}
                            className="text-muted"
                          />
                        </span>
                        <select
                          id="statut"
                          name="statut"
                          className={`form-select border-start-0 ps-0 ${validationErrors.statut ? "is-invalid" : ""}`}
                          value={formData.statut}
                          onChange={handleChange}
                          disabled={loading}
                          style={{ borderRadius: "0 8px 8px 0" }}
                          aria-describedby={
                            validationErrors.statut ? "statut-error" : undefined
                          }
                        >
                          <option value="actif">Actif</option>
                          <option value="inactif">Inactif</option>
                        </select>
                      </div>
                      {validationErrors.statut && (
                        <div
                          id="statut-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.statut}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    {/* Pays */}
                    <div className="col-md-6">
                      <label
                        htmlFor="pays_uuid"
                        className="form-label fw-semibold"
                      >
                        <FontAwesomeIcon icon={faGlobe} className="me-2" />
                        Pays <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <FontAwesomeIcon
                            icon={faGlobe}
                            className="text-muted"
                          />
                        </span>
                        <select
                          id="pays_uuid"
                          name="pays_uuid"
                          className={`form-select border-start-0 ps-0 ${validationErrors.pays_uuid ? "is-invalid" : ""}`}
                          value={formData.pays_uuid}
                          onChange={handleChange}
                          disabled={loading || loadingPays}
                          style={{ borderRadius: "0 8px 8px 0" }}
                          aria-describedby={
                            validationErrors.pays_uuid
                              ? "pays-error"
                              : undefined
                          }
                        >
                          <option value="">Sélectionnez un pays</option>
                          {loadingPays ? (
                            <option value="" disabled>
                              Chargement des pays...
                            </option>
                          ) : pays.length === 0 ? (
                            <option value="" disabled>
                              Aucun pays disponible
                            </option>
                          ) : (
                            pays.map((pays: Pays) => (
                              <option key={pays.uuid} value={pays.uuid}>
                                {pays.nom} ({pays.code})
                              </option>
                            ))
                          )}
                        </select>
                        {loadingPays && (
                          <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                            <FontAwesomeIcon icon={faSpinner} spin className="text-muted" />
                          </div>
                        )}
                      </div>
                      {validationErrors.pays_uuid && (
                        <div
                          id="pays-error"
                          className="invalid-feedback d-block"
                        >
                          {validationErrors.pays_uuid}
                        </div>
                      )}
                      <small className="text-muted">
                        Pays dans lequel se trouve la ville
                      </small>
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    {/* Description */}
                    <div className="col-md-12">
                      <label
                        htmlFor="description"
                        className="form-label fw-semibold"
                      >
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        rows={3}
                        placeholder="Description de la ville (facultatif)"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <small className="text-muted">
                        Description optionnelle de la ville
                      </small>
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    {/* Coordonnées GPS */}
                    <div className="col-md-6">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label
                            htmlFor="latitude"
                            className="form-label fw-semibold"
                          >
                            Latitude
                          </label>
                          <input
                            type="number"
                            id="latitude"
                            name="latitude"
                            className="form-control"
                            placeholder="Ex: 48.8566"
                            step="0.000001"
                            value={formData.latitude || ""}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <small className="text-muted">
                            Coordonnée nord-sud
                          </small>
                        </div>
                        <div className="col-md-6">
                          <label
                            htmlFor="longitude"
                            className="form-label fw-semibold"
                          >
                            Longitude
                          </label>
                          <input
                            type="number"
                            id="longitude"
                            name="longitude"
                            className="form-control"
                            placeholder="Ex: 2.3522"
                            step="0.000001"
                            value={formData.longitude || ""}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <small className="text-muted">
                            Coordonnée est-ouest
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Pied de la modal */}
          <div className="modal-footer border-top-0 py-4 px-4">
            <div className="d-flex justify-content-between w-100">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2"
                onClick={handleReset}
                disabled={loading}
                style={styles.secondaryButton}
                onMouseEnter={(e) => {
                  Object.assign(
                    e.currentTarget.style,
                    styles.secondaryButtonHover,
                  );
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.secondaryButton);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
                Réinitialiser
              </button>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    background: colors.oskar.lightGrey,
                    color: colors.oskar.grey,
                    border: `1px solid ${colors.oskar.grey}30`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.oskar.grey + "15";
                    e.currentTarget.style.color = colors.oskar.black;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.oskar.lightGrey;
                    e.currentTarget.style.color = colors.oskar.grey;
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Annuler
                </button>

                <button
                  type="button"
                  className="btn text-white d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={styles.primaryButton}
                  onMouseEnter={(e) => {
                    Object.assign(
                      e.currentTarget.style,
                      styles.primaryButtonHover,
                    );
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, styles.primaryButton);
                  }}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Créer la Ville
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles inline supplémentaires */}
      <style jsx>{`
        .modal-content {
          border-radius: 16px !important;
          overflow: hidden;
        }

        .card-header {
          border-radius: 12px 12px 0 0 !important;
        }

        .form-control,
        .form-select,
        textarea {
          border-radius: 8px !important;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus,
        textarea:focus {
          border-color: ${colors.oskar.purple};
          box-shadow: 0 0 0 0.25rem ${colors.oskar.purple}25;
        }

        .btn {
          border-radius: 8px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .input-group-text {
          border-radius: 8px 0 0 8px !important;
        }

        .fs-14 {
          font-size: 14px !important;
        }

        .shadow-sm {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .shadow-lg {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
}