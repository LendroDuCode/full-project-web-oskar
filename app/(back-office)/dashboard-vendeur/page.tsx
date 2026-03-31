"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faShoppingBag,
  faGift,
  faExchangeAlt,
  faMoneyBillWave,
  faStar,
  faHeart,
  faTachometerAlt,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faSync,
  faDownload,
  faPlus,
  faFilter,
  faSearch,
  faEye,
  faEdit,
  faTrash,
  faBan,
  faCheckCircle,
  faClock,
  faQuestion,
  faTag,
  faCalendarWeek,
  faArrowUp,
  faArrowDown,
  faBoxOpen,
  faGift as FaGiftIcon,
  faExchangeAlt as FaExchangeAltIcon,
  faStore as FaStoreIcon,
  faBolt,
  faPercent,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendarAlt,
  faImage,
  faClose,
  faHandHoldingHeart,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { buildImageUrl } from "@/app/shared/utils/image-utils";

// Types
interface Stats {
  totalBoutiques: number;
  boutiquesActives: number;
  boutiquesEnReview: number;
  boutiquesBloquees: number;
  totalProduits: number;
  produitsPublies: number;
  produitsNonPublies: number;
  produitsBloques: number;
  totalDons: number;
  donsPublies: number;
  donsBloques: number;
  donsEnAttente: number;
  totalEchanges: number;
  echangesPublies: number;
  echangesBloques: number;
  echangesEnAttente: number;
  revenusTotaux: number;
  revenusProduits: number;
  totalFavoris: number;
  produitsFavoris: number;
  donsFavoris: number;
  echangesFavoris: number;
  avisMoyen: number;
  totalAvis: number;
  tauxConversion: number;
  panierMoyen: number;
}

interface Produit {
  uuid: string;
  libelle: string;
  description?: string;
  prix: string;
  statut: string;
  estPublie: boolean;
  estBloque: boolean;
  dateCreation?: string;
  image: string;
  image_key?: string;
  categorie?: { libelle: string };
  boutique?: { nom: string };
  note_moyenne?: number;
  nombre_avis?: number;
  nombreFavoris?: number;
  quantite?: number;
}

interface Don {
  uuid: string;
  nom: string;
  prix: number | null;
  statut: string;
  estPublie: boolean;
  est_bloque: boolean | null;
  dateCreation?: string;
  image: string;
  categorie?: string;
  type_don?: string;
  nombreFavoris?: number;
  quantite?: number;
  localisation?: string;
  lieu_retrait?: string;
}

interface Echange {
  uuid: string;
  nomElementEchange: string;
  prix: string;
  statut: string;
  estPublie: boolean | null;
  dateCreation?: string;
  image: string;
  categorie?: string;
  objetPropose?: string;
  objetDemande?: string;
  nombreFavoris?: number;
  message?: string;
}

interface Boutique {
  uuid: string;
  nom: string;
  description: string | null;
  logo: string;
  logo_key?: string;
  statut: string;
  created_at: string;
  type_boutique?: { libelle: string };
  est_bloque: boolean;
  est_ferme: boolean;
  produits_count?: number;
}

interface Vendeur {
  uuid: string;
  nom: string;
  prenoms: string;
  avatar: string;
  email?: string;
  telephone?: string;
}

interface FavoriItem {
  uuid: string;
  type: "produit" | "don" | "echange";
  produit?: Produit;
  don?: Don;
  echange?: Echange;
}

// Fonctions utilitaires
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  const url = buildImageUrl(imagePath);
  return url || '';
};

const getPlaceholderImage = (
  size: number,
  text?: string,
  color?: string,
  bgColor?: string,
): string => {
  const defaultText = text || size.toString();
  const defaultColor = color || "ffffff";
  const defaultBgColor = bgColor || "28a745";
  return `https://via.placeholder.com/${size}/${defaultBgColor}/${defaultColor}?text=${encodeURIComponent(defaultText)}`;
};

const formatPrix = (prix: string | number | null) => {
  if (prix === null || prix === undefined) return "Gratuit";
  let montant: number;
  if (typeof prix === "string") {
    const cleanPrix = prix.replace(/[^0-9.-]/g, "");
    montant = parseFloat(cleanPrix) || 0;
  } else {
    montant = prix || 0;
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Non spécifié";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Date invalide";
  }
};

const extractItems = <T,>(response: any): T[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.data?.produits && Array.isArray(response.data.produits)) return response.data.produits;
  if (response.data?.dons && Array.isArray(response.data.dons)) return response.data.dons;
  if (response.data?.echanges && Array.isArray(response.data.echanges)) return response.data.echanges;
  if (response.produits && Array.isArray(response.produits)) return response.produits;
  if (response.dons && Array.isArray(response.dons)) return response.dons;
  if (response.echanges && Array.isArray(response.echanges)) return response.echanges;
  return [];
};

const LoadingSpinner = () => (
  <div className="container-fluid py-5">
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card border-0 shadow-lg text-center py-5">
          <div className="spinner-border text-success mb-3" style={{ width: "4rem", height: "4rem" }} role="status" />
          <h3 className="fw-bold mb-2">Chargement de votre dashboard</h3>
          <p className="text-muted">Veuillez patienter...</p>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon, color = "success", subtitle }: any) => (
  <div className="card border-0 shadow-sm h-100 hover-lift">
    <div className="card-body p-3 p-lg-4">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="flex-grow-1 me-2">
          <h6 className="text-uppercase text-muted mb-1 fw-semibold small">{title}</h6>
          <h3 className="fw-bold mb-0 text-dark">{value}</h3>
          {subtitle && <p className="text-muted mb-0 small mt-1">{subtitle}</p>}
        </div>
        <div className={`rounded-circle p-3 bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0`}
          style={{ width: "clamp(40px, 5vw, 60px)", height: "clamp(40px, 5vw, 60px)" }}>
          <FontAwesomeIcon icon={icon} className={`fs-4 text-${color}`} />
        </div>
      </div>
    </div>
  </div>
);

// Modal de détails
const DetailModal = ({ show, onClose, item, type }: { show: boolean; onClose: () => void; item: any; type: string }) => {
  if (!show || !item) return null;

  const isProduit = type === "produits";
  const isDon = type === "dons";
  const isEchange = type === "echanges";

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
          {/* En-tête */}
          <div className="modal-header border-0" style={{ background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)", borderRadius: "20px 20px 0 0" }}>
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                {isProduit && <FontAwesomeIcon icon={faShoppingBag} className="text-white fs-5" />}
                {isDon && <FontAwesomeIcon icon={faGift} className="text-white fs-5" />}
                {isEchange && <FontAwesomeIcon icon={faExchangeAlt} className="text-white fs-5" />}
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white mb-0">Détails de l'annonce</h5>
                <p className="text-white-50 mb-0 small">{item.libelle || item.nom || item.nomElementEchange}</p>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Corps */}
          <div className="modal-body p-4">
            <div className="row">
              {/* Image */}
              <div className="col-md-5 mb-3 mb-md-0">
                <div className="rounded-4 overflow-hidden bg-light" style={{ height: "250px" }}>
                  {item.image ? (
                    <img src={item.image} alt={item.libelle || item.nom} className="w-100 h-100 object-cover" />
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-muted fs-1" />
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <span className={`badge ${item.estPublie ? "bg-success" : "bg-warning"} px-3 py-2`}>
                    {item.estPublie ? <><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Publié</> : <><FontAwesomeIcon icon={faClock} className="me-1" /> Non publié</>}
                  </span>
                  {item.estBloque && (
                    <span className="badge bg-danger ms-2 px-3 py-2"><FontAwesomeIcon icon={faBan} className="me-1" /> Bloqué</span>
                  )}
                </div>
              </div>

              {/* Informations */}
              <div className="col-md-7">
                <h4 className="fw-bold mb-3">{item.libelle || item.nom || item.nomElementEchange}</h4>
                
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faTag} className="text-primary me-2" style={{ width: "20px" }} />
                    <span className="fw-semibold">Catégorie :</span>
                    <span className="ms-2 text-muted">{item.categorie || "Non catégorisé"}</span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-success me-2" style={{ width: "20px" }} />
                    <span className="fw-semibold">Prix :</span>
                    <span className="ms-2 text-muted">{formatPrix(item.prix)}</span>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-info me-2" style={{ width: "20px" }} />
                    <span className="fw-semibold">Date de création :</span>
                    <span className="ms-2 text-muted">{formatDate(item.date)}</span>
                  </div>

                  {isDon && item.localisation && (
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-danger me-2" style={{ width: "20px" }} />
                      <span className="fw-semibold">Localisation :</span>
                      <span className="ms-2 text-muted">{item.localisation}</span>
                    </div>
                  )}

                  {isDon && item.lieu_retrait && (
                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon icon={faStore} className="text-warning me-2" style={{ width: "20px" }} />
                      <span className="fw-semibold">Lieu de retrait :</span>
                      <span className="ms-2 text-muted">{item.lieu_retrait}</span>
                    </div>
                  )}

                  {isEchange && item.objetPropose && (
                    <div className="d-flex align-items-start mb-2">
                      <FontAwesomeIcon icon={faBox} className="text-primary me-2 mt-1" style={{ width: "20px" }} />
                      <div><span className="fw-semibold">Objet proposé :</span><br /><span className="text-muted small">{item.objetPropose}</span></div>
                    </div>
                  )}

                  {isEchange && item.objetDemande && (
                    <div className="d-flex align-items-start mb-2">
                      <FontAwesomeIcon icon={faHandHoldingHeart} className="text-success me-2 mt-1" style={{ width: "20px" }} />
                      <div><span className="fw-semibold">Objet demandé :</span><br /><span className="text-muted small">{item.objetDemande}</span></div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <div className="mt-3 p-3 bg-light rounded-3">
                    <h6 className="fw-bold mb-2"><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Description</h6>
                    <p className="text-muted mb-0 small">{item.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 justify-content-center pb-4">
            <button className="btn btn-outline-secondary px-4" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} className="me-2" /> Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BoutiqueCard = ({ boutique }: { boutique: Boutique }) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = !imageError && boutique.logo_key 
    ? getImageUrl(boutique.logo_key) 
    : getPlaceholderImage(100, boutique.nom?.charAt(0) || "B", "ffffff", "0d6efd");

  const getStatusBadge = () => {
    if (boutique.est_bloque) return <span className="badge bg-danger">Bloquée</span>;
    if (boutique.est_ferme) return <span className="badge bg-secondary">Fermée</span>;
    if (boutique.statut === "actif") return <span className="badge bg-success">Active</span>;
    if (boutique.statut === "en_attente") return <span className="badge bg-warning text-dark">En attente</span>;
    return <span className="badge bg-secondary">Inactive</span>;
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 border-0 shadow-sm hover-lift">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className="position-relative me-3">
              <img src={logoUrl} alt={boutique.nom} className="rounded-3" style={{ width: "60px", height: "60px", objectFit: "cover" }}
                onError={() => setImageError(true)} />
              <div className="position-absolute top-0 end-0 translate-middle">{getStatusBadge()}</div>
            </div>
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-1 text-dark">{boutique.nom}</h6>
              <small className="text-muted d-block">
                <FontAwesomeIcon icon={faTag} className="me-1" size="xs" />
                {boutique.type_boutique?.libelle || "Boutique standard"}
              </small>
            </div>
          </div>
          <p className="small text-muted mb-2">{boutique.description || "Aucune description"}</p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge bg-light text-dark border">
              <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
              {boutique.produits_count || 0} produit(s)
            </span>
            <span className="badge bg-light text-dark border">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
              {formatDate(boutique.created_at)}
            </span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <Link href={`/dashboard-vendeur/boutique/apercu/${boutique.uuid}`} className="btn btn-sm btn-outline-primary">
              <FontAwesomeIcon icon={faEye} className="me-1" /> Voir
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VendeurDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [dons, setDons] = useState<Don[]>([]);
  const [echanges, setEchanges] = useState<Echange[]>([]);
  const [vendeur, setVendeur] = useState<Vendeur | null>(null);
  const [activeSection, setActiveSection] = useState<"produits" | "dons" | "echanges" | "boutiques">("produits");
  const [activeTab, setActiveTab] = useState<"tous" | "publies" | "bloques">("tous");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemType, setSelectedItemType] = useState<string>("");

  // Charger le profil vendeur
  const fetchVendeurProfile = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.AUTH.VENDEUR.PROFILE);
      console.log("📥 Profil vendeur:", response);
      
      if (response && response.data) {
        setVendeur({
          uuid: response.data.uuid,
          nom: response.data.nom,
          prenoms: response.data.prenoms,
          avatar: response.data.avatar,
          email: response.data.email,
          telephone: response.data.telephone,
        });
      }
    } catch (err) {
      console.warn("Erreur chargement profil vendeur:", err);
    }
  }, []);

  // Calculer les revenus
  const calculerRevenusProduits = (produitsData: Produit[]): number => {
    return produitsData.reduce((total, produit) => {
      if (produit.prix) {
        const prixNettoye = produit.prix.replace(/[^0-9.-]/g, "");
        const prix = parseFloat(prixNettoye) || 0;
        return total + prix;
      }
      return total;
    }, 0);
  };

  // Charger les favoris
  const fetchFavoris = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.FAVORIS.LIST);
      let favorisData: FavoriItem[] = [];
      if (response?.data && Array.isArray(response.data)) favorisData = response.data;
      else if (response?.favoris && Array.isArray(response.favoris)) favorisData = response.favoris;
      else if (Array.isArray(response)) favorisData = response;
      
      return {
        produits: favorisData.filter(f => f.type === "produit").length,
        dons: favorisData.filter(f => f.type === "don").length,
        echanges: favorisData.filter(f => f.type === "echange").length,
        total: favorisData.length
      };
    } catch (err) {
      console.warn("Erreur chargement favoris:", err);
      return { produits: 0, dons: 0, echanges: 0, total: 0 };
    }
  }, []);

  // Charger les données spécifiques
  const fetchProduitsPublies = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.LISTE_PRODUITS_PUBLIES_VENDEUR);
      return extractItems<Produit>(response);
    } catch { return []; }
  }, []);

  const fetchProduitsBloques = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.PRODUCTS.BLOCKED);
      return extractItems<Produit>(response);
    } catch { return []; }
  }, []);

  const fetchDonsPublies = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.DONS.LISTE_DON_PUBLIE_VENDEUR);
      return Array.isArray(response) ? response : [];
    } catch { return []; }
  }, []);

  const fetchDonsBloques = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.DONS.VENDEUR_BLOCKED);
      return extractItems<Don>(response);
    } catch { return []; }
  }, []);

  const fetchEchangesPublies = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.ECHANGES.LISTE_ECHANGES_PUBLIE_VENDEUR);
      return Array.isArray(response) ? response : [];
    } catch { return []; }
  }, []);

  const fetchEchangesBloques = useCallback(async () => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.ECHANGES.VENDEUR_BLOCKED);
      return extractItems<Echange>(response);
    } catch { return []; }
  }, []);

  // Charger toutes les données
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger le profil vendeur
      await fetchVendeurProfile();

      // Charger les boutiques
      let boutiquesData: Boutique[] = [];
      try {
        const boutiquesRes = await api.get<any>(API_ENDPOINTS.BOUTIQUES.LISTE_BOUTIQUES_CREE_PAR_VENDEUR);
        boutiquesData = extractItems<Boutique>(boutiquesRes);
        setBoutiques(boutiquesData);
      } catch (err) { console.warn("Erreur chargement boutiques:", err); }

      // Charger les produits
      let produitsData: Produit[] = [];
      try {
        const produitsRes = await api.get<any>(API_ENDPOINTS.PRODUCTS.VENDEUR_PRODUCTS);
        produitsData = extractItems<Produit>(produitsRes);
        setProduits(produitsData);
      } catch (err) { console.warn("Erreur chargement produits:", err); }

      // Charger les dons
      let donsData: Don[] = [];
      try {
        const donsRes = await api.get<any>(API_ENDPOINTS.DONS.VENDEUR_DONS);
        donsData = extractItems<Don>(donsRes);
        setDons(donsData);
      } catch (err) { console.warn("Erreur chargement dons:", err); }

      // Charger les échanges
      let echangesData: Echange[] = [];
      try {
        const echangesRes = await api.get<any>(API_ENDPOINTS.ECHANGES.VENDEUR_ECHANGES);
        echangesData = extractItems<Echange>(echangesRes);
        setEchanges(echangesData);
      } catch (err) { console.warn("Erreur chargement échanges:", err); }

      // Charger les données spécifiques pour les statistiques
      const [produitsPublies, produitsBloques, donsPublies, donsBloques, echangesPublies, echangesBloques, favorisStats] = await Promise.all([
        fetchProduitsPublies(),
        fetchProduitsBloques(),
        fetchDonsPublies(),
        fetchDonsBloques(),
        fetchEchangesPublies(),
        fetchEchangesBloques(),
        fetchFavoris(),
      ]);

      const revenusProduits = calculerRevenusProduits(produitsData);

      setStats({
        totalBoutiques: boutiquesData.length,
        boutiquesActives: boutiquesData.filter(b => b.statut === "actif" && !b.est_bloque && !b.est_ferme).length,
        boutiquesEnReview: boutiquesData.filter(b => b.statut === "en_attente").length,
        boutiquesBloquees: boutiquesData.filter(b => b.est_bloque || b.est_ferme).length,
        totalProduits: produitsData.length,
        produitsPublies: produitsPublies.length,
        produitsNonPublies: produitsData.filter(p => !p.estPublie && !p.estBloque).length,
        produitsBloques: produitsBloques.length,
        totalDons: donsData.length,
        donsPublies: donsPublies.length,
        donsBloques: donsBloques.length,
        donsEnAttente: donsData.filter(d => !d.estPublie && !d.est_bloque).length,
        totalEchanges: echangesData.length,
        echangesPublies: echangesPublies.length,
        echangesBloques: echangesBloques.length,
        echangesEnAttente: echangesData.filter(e => !e.estPublie).length,
        revenusTotaux: revenusProduits,
        revenusProduits: revenusProduits,
        totalFavoris: favorisStats.total,
        produitsFavoris: favorisStats.produits,
        donsFavoris: favorisStats.dons,
        echangesFavoris: favorisStats.echanges,
        avisMoyen: produitsData.reduce((sum, p) => sum + (p.note_moyenne || 0), 0) / (produitsData.length || 1),
        totalAvis: produitsData.reduce((sum, p) => sum + (p.nombre_avis || 0), 0),
        tauxConversion: 2.8,
        panierMoyen: produitsData.length > 0 ? Math.round(revenusProduits / produitsData.length) : 0,
      });
    } catch (err: any) {
      console.error("Erreur chargement dashboard:", err);
      setError(err?.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [fetchProduitsPublies, fetchProduitsBloques, fetchDonsPublies, fetchDonsBloques, fetchEchangesPublies, fetchEchangesBloques, fetchFavoris, fetchVendeurProfile]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const getFilteredData = () => {
    let data: any[] = [];
    switch (activeSection) {
      case "produits": data = produits; break;
      case "dons": data = dons; break;
      case "echanges": data = echanges; break;
      case "boutiques": data = boutiques; break;
    }
    if (activeSection !== "boutiques") {
      if (activeTab === "publies") data = data.filter((item) => item.estPublie === true);
      else if (activeTab === "bloques") data = data.filter((item) => item.estBloque === true || item.est_bloque === true);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((item: any) => {
        if (activeSection === "boutiques") return item.nom?.toLowerCase().includes(term);
        if (activeSection === "produits") return item.libelle?.toLowerCase().includes(term);
        if (activeSection === "dons") return item.nom?.toLowerCase().includes(term);
        if (activeSection === "echanges") return item.nomElementEchange?.toLowerCase().includes(term);
        return false;
      });
    }
    return data;
  };

  const getDisplayData = (item: any) => {
    switch (activeSection) {
      case "produits":
        return {
          uuid: item.uuid,
          libelle: item.libelle,
          description: item.description,
          image: getImageUrl(item.image || item.image_key) || getPlaceholderImage(50, "P", "ffffff", "28a745"),
          prix: item.prix,
          statut: item.statut,
          estPublie: item.estPublie,
          estBloque: item.estBloque,
          categorie: item.categorie?.libelle || "Non catégorisé",
          date: item.dateCreation,
          nombre_favoris: item.nombreFavoris || 0,
          quantite: item.quantite || 0,
        };
      case "dons":
        return {
          uuid: item.uuid,
          libelle: item.nom,
          description: item.description,
          image: getImageUrl(item.image) || getPlaceholderImage(50, "D", "ffffff", "8b5cf6"),
          prix: item.prix,
          statut: item.statut,
          estPublie: item.estPublie,
          estBloque: item.est_bloque,
          categorie: item.categorie || "Non catégorisé",
          date: item.dateCreation,
          nombre_favoris: item.nombreFavoris || 0,
          localisation: item.localisation,
          lieu_retrait: item.lieu_retrait,
        };
      case "echanges":
        return {
          uuid: item.uuid,
          libelle: item.nomElementEchange,
          description: item.message,
          image: getImageUrl(item.image) || getPlaceholderImage(50, "E", "ffffff", "f59e0b"),
          prix: item.prix,
          statut: item.statut,
          estPublie: item.estPublie === true,
          estBloque: false,
          categorie: item.categorie || "Non catégorisé",
          date: item.dateCreation,
          nombre_favoris: item.nombreFavoris || 0,
          objetPropose: item.objetPropose,
          objetDemande: item.objetDemande,
        };
      default: return item;
    }
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setSelectedItemType(activeSection);
    setShowDetailModal(true);
  };

  const filteredData = getFilteredData();
  const hasAnyData = (stats?.totalProduits || 0) > 0 || (stats?.totalDons || 0) > 0 || (stats?.totalEchanges || 0) > 0 || (stats?.totalBoutiques || 0) > 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container-fluid py-4">
      {/* Modal de détails */}
      <DetailModal show={showDetailModal} onClose={() => setShowDetailModal(false)} item={selectedItem} type={selectedItemType} />

      {/* Header principal avec bienvenue */}
      <div className="mb-5">
        <div className="rounded-4 p-3 p-md-4 shadow-lg mb-4 hero-gradient" style={{ background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)" }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                {vendeur && (
                  <div className="position-relative me-3">
                    <img
                      src={vendeur.avatar ? getImageUrl(vendeur.avatar) : getPlaceholderImage(70, `${vendeur.prenoms?.charAt(0) || 'V'}${vendeur.nom?.charAt(0) || 'D'}`, "ffffff", "28a745")}
                      alt={`${vendeur.prenoms} ${vendeur.nom}`}
                      className="rounded-circle border border-3 border-white shadow"
                      style={{ width: "clamp(50px, 8vw, 70px)", height: "clamp(50px, 8vw, 70px)", objectFit: "cover" }}
                    />
                    <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: "clamp(12px, 2vw, 18px)", height: "clamp(12px, 2vw, 18px)" }}>
                      <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: "clamp(6px, 1vw, 8px)" }} />
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="h3 fw-bold text-white mb-1">
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    Dashboard Vendeur
                  </h1>
                  <p className="text-white-50 mb-2">
                    {vendeur ? `Bonjour ${vendeur.prenoms} ${vendeur.nom}, voici le résumé de votre activité` : "Vue d'ensemble de votre activité"}
                  </p>
                  {vendeur?.email && (
                    <p className="text-white-50 small mb-0">
                      <FontAwesomeIcon icon={faEnvelope} className="me-1" /> {vendeur.email}
                    </p>
                  )}
                  {vendeur?.telephone && (
                    <p className="text-white-50 small mb-0">
                      <FontAwesomeIcon icon={faPhone} className="me-1" /> {vendeur.telephone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4 mt-3 mt-md-0">
              <div className="d-flex justify-content-md-end">
                <button onClick={fetchDashboardData} className="btn btn-outline-light" disabled={loading}>
                  <FontAwesomeIcon icon={faSync} spin={loading} className="me-2" /> Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques - UNIQUEMENT SI DES DONNÉES EXISTENT */}
        {hasAnyData && (
          <>
            <div className="row g-3 g-md-4 mb-4">
              <div className="col-xl-3 col-lg-4 col-md-6"><StatCard title="Boutiques" value={stats?.totalBoutiques || 0} icon={faStore} color="primary" /></div>
              <div className="col-xl-3 col-lg-4 col-md-6"><StatCard title="Produits" value={stats?.totalProduits || 0} icon={faShoppingBag} color="success" /></div>
              <div className="col-xl-3 col-lg-4 col-md-6"><StatCard title="Dons" value={stats?.totalDons || 0} icon={faGift} color="warning" /></div>
              <div className="col-xl-3 col-lg-4 col-md-6"><StatCard title="Échanges" value={stats?.totalEchanges || 0} icon={faExchangeAlt} color="info" /></div>
              <div className="col-xl-3 col-lg-4 col-md-6"><StatCard title="Favoris" value={stats?.totalFavoris || 0} icon={faHeart} color="danger" subtitle={`${stats?.produitsFavoris || 0} produits, ${stats?.donsFavoris || 0} dons, ${stats?.echangesFavoris || 0} échanges`} /></div>
              <div className="col-xl-3 col-lg-4 col-md-6"><StatCard title="Prix moyen" value={formatPrix(stats?.panierMoyen || 0)} icon={faPercent} color="info" /></div>
            </div>

            {/* Messages d'alerte */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show shadow-sm border-0 mb-4">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  <div><strong>Erreur:</strong> {error}</div>
                  <button type="button" className="btn-close ms-auto" onClick={() => setError(null)}></button>
                </div>
              </div>
            )}

            {/* Navigation par sections */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex flex-wrap gap-2">
                  <button className={`btn btn-sm ${activeSection === "produits" ? "btn-success" : "btn-outline-success"}`} onClick={() => { setActiveSection("produits"); setActiveTab("tous"); setSearchTerm(""); }}>
                    <FontAwesomeIcon icon={faShoppingBag} className="me-1" /> Produits ({stats?.totalProduits || 0})
                  </button>
                  <button className={`btn btn-sm ${activeSection === "dons" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => { setActiveSection("dons"); setActiveTab("tous"); setSearchTerm(""); }}>
                    <FontAwesomeIcon icon={faGift} className="me-1" /> Dons ({stats?.totalDons || 0})
                  </button>
                  <button className={`btn btn-sm ${activeSection === "echanges" ? "btn-info" : "btn-outline-info"}`} onClick={() => { setActiveSection("echanges"); setActiveTab("tous"); setSearchTerm(""); }}>
                    <FontAwesomeIcon icon={faExchangeAlt} className="me-1" /> Échanges ({stats?.totalEchanges || 0})
                  </button>
                  <button className={`btn btn-sm ${activeSection === "boutiques" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => { setActiveSection("boutiques"); setActiveTab("tous"); setSearchTerm(""); }}>
                    <FontAwesomeIcon icon={faStore} className="me-1" /> Boutiques ({stats?.totalBoutiques || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Onglets pour produits, dons et échanges */}
            {activeSection !== "boutiques" && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-2 p-md-3">
                  <div className="d-flex flex-wrap gap-2">
                    <button className={`btn btn-sm ${activeTab === "tous" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setActiveTab("tous")}>
                      Tous ({activeSection === "produits" ? stats?.totalProduits : activeSection === "dons" ? stats?.totalDons : stats?.totalEchanges})
                    </button>
                    <button className={`btn btn-sm ${activeTab === "publies" ? "btn-success" : "btn-outline-success"}`} onClick={() => setActiveTab("publies")}>
                      Publiés ({activeSection === "produits" ? stats?.produitsPublies : activeSection === "dons" ? stats?.donsPublies : stats?.echangesPublies})
                    </button>
                    <button className={`btn btn-sm ${activeTab === "bloques" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setActiveTab("bloques")}>
                      Bloqués ({activeSection === "produits" ? stats?.produitsBloques : activeSection === "dons" ? stats?.donsBloques : stats?.echangesBloques})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Barre de recherche */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0"><FontAwesomeIcon icon={faSearch} className="text-success" /></span>
                      <input type="text" className="form-control border-start-0" placeholder={`Rechercher ${activeSection === "produits" ? "un produit" : activeSection === "dons" ? "un don" : activeSection === "echanges" ? "un échange" : "une boutique"}...`}
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      {searchTerm && <button className="btn btn-outline-secondary" onClick={() => setSearchTerm("")}><FontAwesomeIcon icon={faTimes} /></button>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                      {activeSection === "produits" && <Link href="/dashboard-vendeur/produits/nouveau" className="btn btn-success btn-sm"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau produit</Link>}
                      {activeSection === "dons" && <Link href="/dashboard-vendeur/dons/nouveau" className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouveau don</Link>}
                      {activeSection === "echanges" && <Link href="/dashboard-vendeur/echanges/nouveau" className="btn btn-info btn-sm"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouvel échange</Link>}
                      {activeSection === "boutiques" && <Link href="/dashboard-vendeur/boutiques/nouveau" className="btn btn-primary btn-sm"><FontAwesomeIcon icon={faPlus} className="me-1" /> Nouvelle boutique</Link>}
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => { setSearchTerm(""); }}>
                        <FontAwesomeIcon icon={faFilter} className="me-1" /> Réinitialiser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des données ou grille des boutiques */}
            {activeSection === "boutiques" ? (
              <div className="row">
                {filteredData.length === 0 ? (
                  <div className="col-12">
                   
                  </div>
                ) : (
                  filteredData.map((item: any) => <BoutiqueCard key={item.uuid} boutique={item} />)
                )}
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  {filteredData.length === 0 ? (
                    <div className="text-center py-5">
                      <FontAwesomeIcon icon={faBoxOpen} className="text-muted fs-1 mb-3" />
                      <h4 className="fw-bold mb-3">Aucun {activeSection} trouvé</h4>
                      <p className="text-muted mb-4">{searchTerm ? "Aucun résultat ne correspond à votre recherche." : `Commencez par créer votre premier ${activeSection === "produits" ? "produit" : activeSection === "dons" ? "don" : "échange"} !`}</p>
                      <Link href={`/dashboard-vendeur/${activeSection}/nouveau`} className={`btn btn-${activeSection === "produits" ? "success" : activeSection === "dons" ? "warning" : "info"} btn-lg`}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un {activeSection === "produits" ? "produit" : activeSection === "dons" ? "don" : "échange"}
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: "60px" }}>Image</th>
                            <th>Nom</th>
                            <th style={{ width: "100px" }}>Prix</th>
                            <th style={{ width: "90px" }}>Statut</th>
                            <th style={{ width: "120px" }}>Catégorie</th>
                            <th style={{ width: "80px" }} className="text-center"><FontAwesomeIcon icon={faHeart} className="text-danger" /></th>
                            <th style={{ width: "100px" }}>Date</th>
                            <th style={{ width: "80px" }} className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.slice(0, 10).map((item: any) => {
                            const display = getDisplayData(item);
                            return (
                              <tr key={display.uuid}>
                                <td>
                                  <img src={display.image} alt={display.libelle} className="rounded-3" style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                                </td>
                                <td>
                                  <div className="fw-semibold">{display.libelle}</div>
                                  <small className="text-muted">{display.description?.substring(0, 40)}</small>
                                </td>
                                <td><span className="fw-bold text-success">{formatPrix(display.prix)}</span></td>
                                <td>
                                  {display.estBloque ? (
                                    <span className="badge bg-danger"><FontAwesomeIcon icon={faBan} className="me-1" /> Bloqué</span>
                                  ) : display.estPublie ? (
                                    <span className="badge bg-success"><FontAwesomeIcon icon={faCheckCircle} className="me-1" /> Publié</span>
                                  ) : (
                                    <span className="badge bg-warning"><FontAwesomeIcon icon={faClock} className="me-1" /> Non publié</span>
                                  )}
                                </td>
                                <td><span className="badge bg-info">{display.categorie}</span></td>
                                <td className="text-center"><span className="badge bg-danger bg-opacity-10 text-danger">{display.nombre_favoris || 0}</span></td>
                                <td><small className="text-muted">{formatDate(display.date)}</small></td>
                                <td className="text-center">
                                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleViewDetails(display)} title="Voir les détails">
                                    <FontAwesomeIcon icon={faEye} className="me-1" /> Voir
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Message quand aucune donnée */}
        {!hasAnyData && !loading && (
          <div className="text-center py-5">
            <FontAwesomeIcon icon={faStore} className="text-muted mb-4 fs-1" />
            <h3 className="fw-bold mb-3">Bienvenue sur votre dashboard vendeur !</h3>
            <p className="text-muted mb-4">Vous n'avez pas encore créé d'annonces ou de boutiques. Commencez dès maintenant !</p>
            {/* <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link href="/dashboard-vendeur/produits/nouveau" className="btn btn-success btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un produit</Link>
              <Link href="/dashboard-vendeur/dons/nouveau" className="btn btn-warning btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un don</Link>
              <Link href="/dashboard-vendeur/echanges/nouveau" className="btn btn-info btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer un échange</Link>
              <Link href="/dashboard-vendeur/boutiques/nouveau" className="btn btn-primary btn-lg px-4"><FontAwesomeIcon icon={faPlus} className="me-2" /> Créer une boutique</Link>
            </div> */}
          </div>
        )}
      </div>

      <style jsx global>{`
        .hero-gradient { background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.1) !important; }
        .badge { font-weight: 500; letter-spacing: 0.3px; padding: 0.3em 0.6em; }
        .card { transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 12px; overflow: hidden; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.1) !important; }
        .btn-success { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border: none; }
        .btn-warning { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); border: none; color: #212529; }
        .btn-info { background: linear-gradient(135deg, #17a2b8 0%, #0dcaf0 100%); border: none; color: white; }
        .btn-primary { background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%); border: none; }
        .object-cover { object-fit: cover; }
      `}</style>
    </div>
  );
}