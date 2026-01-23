"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Store,
  Package,
  Gift,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Calendar,
  ChevronRight,
  Activity,
  Filter,
  Search,
  User,
  ShoppingCart,
  Home,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  DollarSign,
  ShoppingBag,
  Heart,
  MessageSquare,
} from "lucide-react";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Types basés sur les retours API
type Utilisateur = {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  est_verifie: boolean;
  est_bloque: boolean;
  created_at: string;
  civilite?: {
    libelle: string;
  };
  role?: {
    name: string;
  };
};

type Vendeur = {
  uuid: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  est_bloque: boolean;
  type?: string;
  created_at: string;
  civilite?: {
    libelle: string;
  };
};

type Boutique = {
  uuid: string;
  nom: string;
  slug: string;
  description: string;
  statut: string;
  created_at: string;
  type_boutique: {
    libelle: string;
  };
  est_bloque: boolean;
  est_ferme: boolean;
  logo?: string;
};

// CORRECTION : Changer le type de 'image' à string | undefined
type Produit = {
  uuid: string;
  libelle: string;
  prix: string;
  image: string | undefined; // Changé de 'string' à 'string | undefined'
  disponible: boolean;
  statut: string;
  created_at: string;
  boutique?: {
    nom: string;
  };
  quantite: number;
};

type Don = {
  uuid: string;
  nom: string;
  type_don: string;
  prix: number | null;
  image: string | undefined; // Changé de 'string' à 'string | undefined'
  statut: string;
  estPublie: boolean;
  disponible: boolean;
  quantite: number;
  created_at: string;
};

type Echange = {
  uuid: string;
  nomElementEchange: string;
  prix: string;
  image: string | undefined; // Changé de 'string' à 'string | undefined'
  statut: string;
  estPublie: boolean;
  disponible: boolean;
  quantite: number;
  created_at: string;
};

type DashboardStats = {
  totalUtilisateurs: number;
  utilisateursBloques: number;
  utilisateursVerifies: number;
  totalVendeurs: number;
  vendeursBloques: number;
  vendeursSupprimes: number;
  totalBoutiques: number;
  boutiquesActive: number;
  boutiquesBloquees: number;
  totalProduits: number;
  produitsPublies: number;
  totalDons: number;
  donsPublies: number;
  totalEchanges: number;
  echangesPublies: number;
  echangesEnAttente: number;
  commandesTotal: number;
  revenusTotal: number;
  tauxConversion: number;
};

// Fonction pour obtenir le token d'authentification
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token")
    );
  }
  return null;
};

// Fonction pour construire une URL complète
const buildUrl = (url: string): string => {
  if (url.startsWith("http")) {
    return url;
  }

  // Utiliser la variable d'environnement pour l'URL de base
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
  return `${baseUrl}${url}`;
};

// Fonction pour remplacer les URLs locales par l'URL de base
const replaceLocalUrl = (url?: string): string | undefined => {
  if (!url) return undefined;

  // Si l'URL contient déjà le domaine localhost:3005, on la remplace
  if (url.includes("http://localhost:3005")) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";
    return url.replace("http://localhost:3005", baseUrl);
  }

  // Si c'est une URL relative qui commence par /api/files, on construit l'URL complète
  if (url.startsWith("/api/files")) {
    return buildUrl(url);
  }

  return url;
};

// Données pour les graphiques
const generateChartData = (stats: DashboardStats) => {
  // Données pour le graphique de distribution des contenus
  const contentDistributionData = [
    { name: "Produits", value: stats.totalProduits, color: "#4e73df" },
    { name: "Dons", value: stats.totalDons, color: "#1cc88a" },
    { name: "Échanges", value: stats.totalEchanges, color: "#36b9cc" },
    { name: "Boutiques", value: stats.totalBoutiques, color: "#f6c23e" },
  ];

  // Données pour le graphique d'évolution mensuelle
  const monthlyTrendData = [
    { mois: "Jan", utilisateurs: 120, produits: 45, revenus: 1200000 },
    { mois: "Fév", utilisateurs: 180, produits: 62, revenus: 1800000 },
    { mois: "Mar", utilisateurs: 210, produits: 78, revenus: 2100000 },
    { mois: "Avr", utilisateurs: 250, produits: 92, revenus: 2500000 },
    { mois: "Mai", utilisateurs: 280, produits: 105, revenus: 2800000 },
    { mois: "Juin", utilisateurs: 320, produits: 128, revenus: 3200000 },
  ];

  // Données pour le graphique de statut des échanges
  const exchangeStatusData = [
    { name: "En attente", value: stats.echangesEnAttente, color: "#f6c23e" },
    {
      name: "Acceptés",
      value: Math.floor(stats.totalEchanges * 0.6),
      color: "#1cc88a",
    },
    {
      name: "Refusés",
      value: Math.floor(stats.totalEchanges * 0.1),
      color: "#e74a3b",
    },
    { name: "Publiés", value: stats.echangesPublies, color: "#4e73df" },
  ];

  // Données pour le graphique des utilisateurs par type
  const userTypeData = [
    { name: "Utilisateurs", value: stats.totalUtilisateurs, color: "#4e73df" },
    { name: "Vendeurs", value: stats.totalVendeurs, color: "#1cc88a" },
    {
      name: "Bloqués",
      value: stats.utilisateursBloques + stats.vendeursBloques,
      color: "#e74a3b",
    },
    { name: "Vérifiés", value: stats.utilisateursVerifies, color: "#36b9cc" },
  ];

  return {
    contentDistributionData,
    monthlyTrendData,
    exchangeStatusData,
    userTypeData,
  };
};

const AgentDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUtilisateurs: 0,
    utilisateursBloques: 0,
    utilisateursVerifies: 0,
    totalVendeurs: 0,
    vendeursBloques: 0,
    vendeursSupprimes: 0,
    totalBoutiques: 0,
    boutiquesActive: 0,
    boutiquesBloquees: 0,
    totalProduits: 0,
    produitsPublies: 0,
    totalDons: 0,
    donsPublies: 0,
    totalEchanges: 0,
    echangesPublies: 0,
    echangesEnAttente: 0,
    commandesTotal: 125,
    revenusTotal: 3250000,
    tauxConversion: 3.2,
  });

  const [recentUtilisateurs, setRecentUtilisateurs] = useState<Utilisateur[]>(
    [],
  );
  const [recentVendeurs, setRecentVendeurs] = useState<Vendeur[]>([]);
  const [recentBoutiques, setRecentBoutiques] = useState<Boutique[]>([]);
  const [recentProduits, setRecentProduits] = useState<Produit[]>([]);
  const [recentDons, setRecentDons] = useState<Don[]>([]);
  const [recentEchanges, setRecentEchanges] = useState<Echange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemoData, setShowDemoData] = useState(false);
  const [chartData, setChartData] = useState<any>({});

  // Fonction pour récupérer les données avec gestion d'erreur
  const fetchWithAuth = async (url: string): Promise<any> => {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const fullUrl = buildUrl(url);

      console.log(`🌐 Fetching from: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        setShowDemoData(true);
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log(`✅ Response from ${url}:`, data);
        return data;
      } else {
        console.log(`⚠️ Non-JSON response from ${url}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error);
      setShowDemoData(true);
      return null;
    }
  };

  // Fonction pour charger les données de démo
  const loadDemoData = () => {
    // Construire les URLs d'image avec la variable d'environnement
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

    // Données de démo pour les utilisateurs
    const demoUsers: Utilisateur[] = [
      {
        uuid: "1",
        nom: "TRAORE",
        prenoms: "Mariame Grâce",
        email: "mariame.traore@user.com",
        telephone: "+2250102030402",
        est_verifie: true,
        est_bloque: false,
        created_at: "2025-12-15T10:30:00.000Z",
        civilite: { libelle: "Madame" },
        role: { name: "Utilisateur" },
      },
      {
        uuid: "2",
        nom: "KOUBY",
        prenoms: "Razan",
        email: "aziz@gmail.com",
        telephone: "+225 01 01 01 01",
        est_verifie: false,
        est_bloque: false,
        created_at: "2025-12-18T14:20:00.000Z",
        civilite: { libelle: "Mademoiselle" },
        role: { name: "Utilisateur" },
      },
      {
        uuid: "3",
        nom: "KARAMOKO",
        prenoms: "Deto Léandre",
        email: "deto.leandre@sonec.com",
        telephone: "0946798486",
        est_verifie: true,
        est_bloque: false,
        created_at: "2025-12-20T09:15:00.000Z",
        civilite: { libelle: "Monsieur" },
        role: { name: "Utilisateur" },
      },
      {
        uuid: "4",
        nom: "N'GUESSAN",
        prenoms: "Linda Christelle",
        email: "linda.nguessan@user.com",
        telephone: "+2250102030404",
        est_verifie: true,
        est_bloque: true,
        created_at: "2025-12-22T11:45:00.000Z",
        civilite: { libelle: "Monsieur" },
        role: { name: "Utilisateur" },
      },
      {
        uuid: "5",
        nom: "KOFFI",
        prenoms: "Anane Blé",
        email: "koffi.anane@sonec.com",
        telephone: "+2250506070809",
        est_verifie: true,
        est_bloque: false,
        created_at: "2025-12-25T16:30:00.000Z",
        civilite: { libelle: "Monsieur" },
        role: { name: "Utilisateur" },
      },
    ];

    // Données de démo pour les vendeurs
    const demoVendeurs: Vendeur[] = [
      {
        uuid: "1",
        nom: "KONE",
        prenoms: "Fatou",
        email: "fatou.kone@sonecafrica.com",
        telephone: "+2250102030405",
        est_bloque: false,
        type: "standard",
        created_at: "2025-12-10T08:00:00.000Z",
        civilite: { libelle: "Madame" },
      },
      {
        uuid: "2",
        nom: "CISSE",
        prenoms: "Ibrahima",
        email: "ibrahima.cisse@sonecafrica.com",
        telephone: "+2250102030405",
        est_bloque: false,
        type: "standard",
        created_at: "2025-12-12T10:30:00.000Z",
        civilite: { libelle: "Mademoiselle" },
      },
      {
        uuid: "3",
        nom: "DIALLO",
        prenoms: "Nina",
        email: "nina.diallo@sonecafrica.com",
        telephone: "+2250102030405",
        est_bloque: false,
        type: "standard",
        created_at: "2025-12-14T14:15:00.000Z",
        civilite: { libelle: "Monsieur" },
      },
      {
        uuid: "4",
        nom: "KALL",
        prenoms: "Chancelle",
        email: "kall.chancelle@sonec.com",
        telephone: "+2250506070806",
        est_bloque: true,
        type: "premium",
        created_at: "2025-12-16T16:45:00.000Z",
        civilite: { libelle: "Madame" },
      },
      {
        uuid: "5",
        nom: "ALABACHI",
        prenoms: "Verouse",
        email: "alabachi.verouse@seller.com",
        telephone: "+22501010102",
        est_bloque: false,
        type: "premium",
        created_at: "2025-12-18T09:20:00.000Z",
        civilite: { libelle: "Mademoiselle" },
      },
    ];

    // Données de démo pour les produits
    const demoProduits: Produit[] = [
      {
        uuid: "1",
        libelle: "Casque Audio Sony WH-1000XM5",
        prix: "250000.00",
        image: replaceLocalUrl(
          "/api/files/produits%2F1767458848791-529269243.jpg",
        ),
        disponible: true,
        statut: "publie",
        created_at: "2026-01-03T07:09:34.000Z",
        quantite: 2,
      },
      {
        uuid: "2",
        libelle: "Smartphone Samsung Galaxy S23",
        prix: "450000.00",
        image: replaceLocalUrl(
          "/api/files/produits%2F1766486629814-459629390.png",
        ),
        disponible: true,
        statut: "publie",
        created_at: "2026-01-02T14:30:00.000Z",
        quantite: 5,
      },
      {
        uuid: "3",
        libelle: "Ordinateur Portable Dell XPS 13",
        prix: "850000.00",
        image: replaceLocalUrl(
          "/api/files/produits%2F1766489386966-526764004.png",
        ),
        disponible: false,
        statut: "publie",
        created_at: "2026-01-01T10:15:00.000Z",
        quantite: 0,
      },
    ];

    // Données de démo pour les dons
    const demoDons: Don[] = [
      {
        uuid: "1",
        nom: "Feu",
        type_don: "Allumette",
        prix: null,
        image: replaceLocalUrl("/api/files/dons%2F1766486667118-485210721.png"),
        statut: "publie",
        estPublie: true,
        disponible: true,
        quantite: 1,
        created_at: "2025-12-23T10:44:28.000Z",
      },
      {
        uuid: "2",
        nom: "Jeux de société",
        type_don: "Loisirs",
        prix: null,
        image: replaceLocalUrl("/api/files/dons%2F1767043164025-25999572.png"),
        statut: "disponible",
        estPublie: false,
        disponible: true,
        quantite: 1,
        created_at: "2025-12-29T21:19:25.000Z",
      },
    ];

    // Données de démo pour les échanges
    const demoEchanges: Echange[] = [
      {
        uuid: "1",
        nomElementEchange: "Cahier vs Galaxy S21",
        prix: "100000.00",
        image: replaceLocalUrl(
          "/api/files/echanges%2F1766486726483-332824154.png",
        ),
        statut: "en_attente",
        estPublie: true,
        disponible: true,
        quantite: 2,
        created_at: "2025-12-23T10:45:27.000Z",
      },
      {
        uuid: "2",
        nomElementEchange: "iPhone 12 Pro vs Samsung",
        prix: "150000.00",
        image: replaceLocalUrl(
          "/api/files/echanges%2F1766486726483-332824154.png",
        ),
        statut: "accepte",
        estPublie: true,
        disponible: false,
        quantite: 1,
        created_at: "2025-12-20T15:30:00.000Z",
      },
    ];

    // Données de démo pour les boutiques
    const demoBoutiques: Boutique[] = [
      {
        uuid: "1",
        nom: "FashionZenith",
        slug: "fashionzenith-1",
        description: "Boutique de mode tendance",
        statut: "actif",
        created_at: "2026-01-03T05:33:27.000Z",
        type_boutique: { libelle: "Boutique Biens" },
        est_bloque: false,
        est_ferme: false,
        logo: replaceLocalUrl(
          "/api/files/boutiques%2Flogos%2F1767419547643-652761049.jpg",
        ),
      },
      {
        uuid: "2",
        nom: "MaBoutik",
        slug: "maboutik",
        description: "Accessoires divers",
        statut: "actif",
        created_at: "2026-01-03T15:38:52.000Z",
        type_boutique: { libelle: "Vente accessoire" },
        est_bloque: false,
        est_ferme: false,
        logo: replaceLocalUrl(
          "/api/files/boutiques%2Flogos%2F1767454730509-869346568.jpg",
        ),
      },
    ];

    // Mise à jour des données de démo
    setRecentUtilisateurs(demoUsers);
    setRecentVendeurs(demoVendeurs);
    setRecentProduits(demoProduits);
    setRecentDons(demoDons);
    setRecentEchanges(demoEchanges);
    setRecentBoutiques(demoBoutiques);

    // Mise à jour des statistiques de démo
    const demoStats = {
      totalUtilisateurs: demoUsers.length,
      utilisateursBloques: demoUsers.filter((u) => u.est_bloque).length,
      utilisateursVerifies: demoUsers.filter((u) => u.est_verifie).length,
      totalVendeurs: demoVendeurs.length,
      vendeursBloques: demoVendeurs.filter((v) => v.est_bloque).length,
      vendeursSupprimes: 0,
      totalBoutiques: demoBoutiques.length,
      boutiquesActive: demoBoutiques.filter(
        (b) => !b.est_bloque && !b.est_ferme,
      ).length,
      boutiquesBloquees: demoBoutiques.filter((b) => b.est_bloque).length,
      totalProduits: demoProduits.length,
      produitsPublies: demoProduits.filter((p) => p.statut === "publie").length,
      totalDons: demoDons.length,
      donsPublies: demoDons.filter((d) => d.estPublie).length,
      totalEchanges: demoEchanges.length,
      echangesPublies: demoEchanges.filter((e) => e.estPublie).length,
      echangesEnAttente: demoEchanges.filter((e) => e.statut === "en_attente")
        .length,
      commandesTotal: 125,
      revenusTotal: 3250000,
      tauxConversion: 3.2,
    };

    setStats(demoStats);
    setChartData(generateChartData(demoStats));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoints = [
          { key: "users", url: API_ENDPOINTS.ADMIN.USERS.LIST },
          { key: "vendeurs", url: API_ENDPOINTS.ADMIN.VENDEURS.LIST },
          { key: "produits", url: API_ENDPOINTS.PRODUCTS.ALL },
          { key: "dons", url: API_ENDPOINTS.DONS.LIST },
          { key: "echanges", url: API_ENDPOINTS.ECHANGES.LIST },
          { key: "boutiques", url: API_ENDPOINTS.BOUTIQUES.ALL },
        ];

        let allDataSuccess = true;
        const results: Record<string, any> = {};

        for (const endpoint of endpoints) {
          try {
            const data = await fetchWithAuth(endpoint.url);
            if (data) {
              results[endpoint.key] = data;
            } else {
              allDataSuccess = false;
            }
          } catch (err) {
            allDataSuccess = false;
          }
        }

        if (allDataSuccess && Object.keys(results).length > 0) {
          // Traitement des données réelles
          const usersData = results.users?.data || results.users || [];
          const vendeursData = results.vendeurs?.data || results.vendeurs || [];
          const produitsData = results.produits || [];
          const donsData = results.dons || [];
          const echangesData = results.echanges || [];
          const boutiquesData =
            results.boutiques?.data || results.boutiques || [];

          // Remplacer les URLs d'images dans les données
          const processedUsers = Array.isArray(usersData)
            ? usersData.slice(0, 5).map((user: Utilisateur) => ({
                ...user,
              }))
            : [];

          const processedVendeurs = Array.isArray(vendeursData)
            ? vendeursData.slice(0, 5).map((vendeur: Vendeur) => ({
                ...vendeur,
              }))
            : [];

          const processedProduits = Array.isArray(produitsData)
            ? produitsData.slice(0, 5).map((produit: any) => ({
                ...produit,
                image: replaceLocalUrl(produit.image),
              }))
            : [];

          const processedDons = Array.isArray(donsData)
            ? donsData.slice(0, 5).map((don: any) => ({
                ...don,
                image: replaceLocalUrl(don.image),
              }))
            : [];

          const processedEchanges = Array.isArray(echangesData)
            ? echangesData.slice(0, 5).map((echange: any) => ({
                ...echange,
                image: replaceLocalUrl(echange.image),
              }))
            : [];

          const processedBoutiques = Array.isArray(boutiquesData)
            ? boutiquesData.slice(0, 5).map((boutique: Boutique) => ({
                ...boutique,
                logo: replaceLocalUrl(boutique.logo),
              }))
            : [];

          setRecentUtilisateurs(processedUsers);
          setRecentVendeurs(processedVendeurs);
          setRecentProduits(processedProduits);
          setRecentDons(processedDons);
          setRecentEchanges(processedEchanges);
          setRecentBoutiques(processedBoutiques);

          // Calcul des statistiques
          const newStats = {
            totalUtilisateurs: Array.isArray(usersData) ? usersData.length : 0,
            utilisateursBloques: Array.isArray(usersData)
              ? usersData.filter((u: Utilisateur) => u.est_bloque).length
              : 0,
            utilisateursVerifies: Array.isArray(usersData)
              ? usersData.filter((u: Utilisateur) => u.est_verifie).length
              : 0,
            totalVendeurs: Array.isArray(vendeursData)
              ? vendeursData.length
              : 0,
            vendeursBloques: Array.isArray(vendeursData)
              ? vendeursData.filter((v: Vendeur) => v.est_bloque).length
              : 0,
            vendeursSupprimes: 0,
            totalBoutiques: Array.isArray(boutiquesData)
              ? boutiquesData.length
              : 0,
            boutiquesActive: Array.isArray(boutiquesData)
              ? boutiquesData.filter(
                  (b: Boutique) => !b.est_bloque && !b.est_ferme,
                ).length
              : 0,
            boutiquesBloquees: Array.isArray(boutiquesData)
              ? boutiquesData.filter((b: Boutique) => b.est_bloque).length
              : 0,
            totalProduits: Array.isArray(produitsData)
              ? produitsData.length
              : 0,
            produitsPublies: Array.isArray(produitsData)
              ? produitsData.filter((p: any) => p.statut === "publie").length
              : 0,
            totalDons: Array.isArray(donsData) ? donsData.length : 0,
            donsPublies: Array.isArray(donsData)
              ? donsData.filter((d: any) => d.estPublie).length
              : 0,
            totalEchanges: Array.isArray(echangesData)
              ? echangesData.length
              : 0,
            echangesPublies: Array.isArray(echangesData)
              ? echangesData.filter((e: any) => e.estPublie).length
              : 0,
            echangesEnAttente: Array.isArray(echangesData)
              ? echangesData.filter((e: any) => e.statut === "en_attente")
                  .length
              : 0,
            commandesTotal: 125,
            revenusTotal: 3250000,
            tauxConversion: 3.2,
          };

          setStats(newStats);
          setChartData(generateChartData(newStats));
        } else {
          setShowDemoData(true);
          loadDemoData();
        }
      } catch (error) {
        console.error("❌ Error in fetchData:", error);
        setError(
          "Impossible de charger les données. Affichage des données de démo.",
        );
        setShowDemoData(true);
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return "0 FCFA";
    const numAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
        : amount;
    if (isNaN(numAmount)) return "0 FCFA";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("fr-FR");
  };

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  const getStatusClass = (status: boolean | string) => {
    if (typeof status === "boolean") {
      return status ? "success" : "secondary";
    }

    switch (status) {
      case "actif":
      case "publie":
      case "accepte":
      case "disponible":
        return "success";
      case "bloque":
      case "supprime":
      case "refuse":
        return "danger";
      case "en_attente":
      case "en_review":
        return "warning";
      default:
        return "secondary";
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    change,
    subtitle,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: "primary" | "success" | "info" | "warning" | "danger";
    change?: number;
    subtitle?: string;
  }) => {
    const colorClasses = {
      primary: "border-left-primary",
      success: "border-left-success",
      info: "border-left-info",
      warning: "border-left-warning",
      danger: "border-left-danger",
    };

    const bgColors = {
      primary: "bg-primary",
      success: "bg-success",
      info: "bg-info",
      warning: "bg-warning",
      danger: "bg-danger",
    };

    return (
      <div className={`card ${colorClasses[color]} shadow h-100`}>
        <div className="card-body">
          <div className="row no-gutters align-items-center">
            <div className="col mr-2">
              <div
                className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}
              >
                {title}
              </div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">
                {typeof value === "number" ? formatNumber(value) : value}
              </div>
              {subtitle && (
                <div className="mt-2 text-xs text-muted">{subtitle}</div>
              )}
              {change !== undefined && (
                <div className="mt-2">
                  <span
                    className={`badge bg-${change >= 0 ? "success" : "danger"}`}
                  >
                    {change >= 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {Math.abs(change)}%
                  </span>
                </div>
              )}
            </div>
            <div className="col-auto">
              <div
                className={`${bgColors[color]} text-white rounded-circle p-3`}
              >
                {icon}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted fs-5">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* En-tête */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4 p-4 bg-white shadow-sm">
        <div>
          <h1 className="h2 mb-1 text-gray-800 fw-bold">
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard Agent
          </h1>
          <p className="mb-0 text-muted">
            Vue d'ensemble complète de votre plateforme{" "}
            {showDemoData && (
              <span className="badge bg-warning">Données de démo</span>
            )}
          </p>
        </div>
        <div className="d-flex gap-3">
          <button className="btn btn-outline-gray-600 d-flex align-items-center">
            <Calendar className="me-2" size={16} />
            <span className="d-none d-sm-inline">Cette semaine</span>
            <ChevronRight className="ms-2" size={16} />
          </button>
          <button className="btn btn-primary d-flex align-items-center">
            <Download className="me-2" size={16} />
            <span className="d-none d-sm-inline">Exporter rapport</span>
          </button>
        </div>
      </div>

      {/* Alertes */}
      <div className="px-4">
        {showDemoData && (
          <div
            className="alert alert-info alert-dismissible fade show mb-4 shadow-sm"
            role="alert"
          >
            <AlertCircle className="me-2" size={20} />
            <strong>Affichage des données de démo.</strong> Connectez-vous pour
            voir les données réelles.
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowDemoData(false)}
            ></button>
          </div>
        )}

        {error && (
          <div
            className="alert alert-warning alert-dismissible fade show mb-4 shadow-sm"
            role="alert"
          >
            <AlertCircle className="me-2" size={20} />
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="container-fluid px-4">
        {/* Statistiques principales */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-4">
            <StatCard
              title="Utilisateurs totaux"
              value={stats.totalUtilisateurs}
              icon={<Users size={24} />}
              color="primary"
              change={12.5}
              subtitle={`${stats.utilisateursBloques} bloqués • ${stats.utilisateursVerifies} vérifiés`}
            />
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <StatCard
              title="Vendeurs actifs"
              value={stats.totalVendeurs - stats.vendeursBloques}
              icon={<Store size={24} />}
              color="success"
              change={8.2}
              subtitle={`${stats.vendeursBloques} bloqués • Total: ${stats.totalVendeurs}`}
            />
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <StatCard
              title="Contenu total"
              value={
                stats.totalProduits + stats.totalDons + stats.totalEchanges
              }
              icon={<Package size={24} />}
              color="info"
              change={15.3}
              subtitle={`${stats.totalProduits} produits • ${stats.totalDons} dons • ${stats.totalEchanges} échanges`}
            />
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <StatCard
              title="Boutiques"
              value={stats.totalBoutiques}
              icon={<ShoppingCart size={24} />}
              color="warning"
              change={5.7}
              subtitle={`${stats.boutiquesActive} actives • ${stats.boutiquesBloquees} bloquées`}
            />
          </div>
        </div>

        {/* Graphiques */}
        <div className="row mb-4">
          {/* Graphique d'évolution mensuelle */}
          <div className="col-xl-8 mb-4">
            <div className="card shadow h-100">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  <LineChart className="me-2" size={20} />
                  Évolution mensuelle
                </h6>
                <div className="dropdown no-arrow">
                  <button className="btn btn-link btn-sm" type="button">
                    <Filter size={16} />
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mois" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      formatter={(value) => [formatNumber(Number(value)), ""]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="utilisateurs"
                      stroke="#4e73df"
                      fill="#4e73df"
                      fillOpacity={0.1}
                      name="Utilisateurs"
                    />
                    <Area
                      type="monotone"
                      dataKey="produits"
                      stroke="#1cc88a"
                      fill="#1cc88a"
                      fillOpacity={0.1}
                      name="Produits"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenus"
                      stroke="#f6c23e"
                      fill="#f6c23e"
                      fillOpacity={0.1}
                      name="Revenus (FCFA)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Graphique circulaire de distribution */}
          <div className="col-xl-4 mb-4">
            <div className="card shadow h-100">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  <PieChartIcon className="me-2" size={20} />
                  Distribution du contenu
                </h6>
              </div>
              <div className="card-body" style={{ height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.contentDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.contentDistributionData?.map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatNumber(Number(value)),
                        "Quantité",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Deuxième ligne de graphiques */}
        <div className="row mb-4">
          {/* Graphique des statuts d'échanges */}
          <div className="col-xl-6 mb-4">
            <div className="card shadow h-100">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  <BarChart3 className="me-2" size={20} />
                  Statut des échanges
                </h6>
              </div>
              <div className="card-body" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.exchangeStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      formatter={(value) => [
                        formatNumber(Number(value)),
                        "Quantité",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.exchangeStatusData?.map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Graphique des types d'utilisateurs */}
          <div className="col-xl-6 mb-4">
            <div className="card shadow h-100">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  <Users className="me-2" size={20} />
                  Répartition des utilisateurs
                </h6>
              </div>
              <div className="card-body" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {chartData.userTypeData?.map(
                        (entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ),
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatNumber(Number(value)),
                        "Quantité",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="row mb-4">
          <div className="col-md-3 mb-4">
            <div className="card border-left-danger shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                      Échanges en attente
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.echangesEnAttente}
                    </div>
                  </div>
                  <div className="col-auto">
                    <Clock className="text-danger" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-left-warning shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Taux de publication
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {calculatePercentage(
                        stats.produitsPublies,
                        stats.totalProduits,
                      )}
                      %
                    </div>
                  </div>
                  <div className="col-auto">
                    <CheckCircle className="text-warning" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-left-info shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Contenu publié
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.produitsPublies +
                        stats.donsPublies +
                        stats.echangesPublies}
                    </div>
                  </div>
                  <div className="col-auto">
                    <Activity className="text-info" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card border-left-success shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                      Taux de conversion
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stats.tauxConversion}%
                    </div>
                  </div>
                  <div className="col-auto">
                    <TrendingUp className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal avec listes */}
        <div className="row">
          {/* Colonne gauche - Listes */}
          <div className="col-lg-8">
            {/* Utilisateurs récents */}
            <div className="card shadow mb-4">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  <Users className="me-2" size={20} />
                  Utilisateurs récents
                </h6>
                <button className="btn btn-link btn-sm text-primary p-0">
                  Voir tout <ChevronRight size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="bg-light">
                      <tr>
                        <th>Nom & Prénom</th>
                        <th>Email</th>
                        <th>Statut</th>
                        <th>Vérification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUtilisateurs.map((user) => (
                        <tr key={user.uuid} className="align-middle">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                                <User size={16} className="text-primary" />
                              </div>
                              <div>
                                <div className="fw-semibold">
                                  {user.nom} {user.prenoms}
                                </div>
                                <small className="text-muted">
                                  {user.telephone}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {user.email}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${getStatusClass(user.est_bloque ? "bloque" : "actif")}`}
                            >
                              {user.est_bloque ? "Bloqué" : "Actif"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${user.est_verifie ? "success" : "warning"}`}
                            >
                              {user.est_verifie ? "Vérifié" : "Non vérifié"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Vendeurs récents */}
            <div className="card shadow mb-4">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  <Store className="me-2" size={20} />
                  Vendeurs récents
                </h6>
                <button className="btn btn-link btn-sm text-primary p-0">
                  Voir tout <ChevronRight size={16} />
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="bg-light">
                      <tr>
                        <th>Nom & Prénom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Statut</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentVendeurs.map((vendeur) => (
                        <tr key={vendeur.uuid} className="align-middle">
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                                <Store size={16} className="text-success" />
                              </div>
                              <div>
                                <div className="fw-semibold">
                                  {vendeur.nom} {vendeur.prenoms}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className="text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {vendeur.email}
                          </td>
                          <td>{vendeur.telephone}</td>
                          <td>
                            <span
                              className={`badge bg-${getStatusClass(vendeur.est_bloque ? "bloque" : "actif")}`}
                            >
                              {vendeur.est_bloque ? "Bloqué" : "Actif"}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {vendeur.type || "Standard"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Statistiques et actions */}
          <div className="col-lg-4">
            {/* Statistiques de contenu */}
            <div className="card shadow mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="m-0 font-weight-bold text-primary">
                  Statistiques de contenu
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Produits</span>
                    <span className="fw-bold">{stats.totalProduits}</span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{
                        width: `${calculatePercentage(stats.totalProduits, stats.totalProduits + stats.totalDons + stats.totalEchanges + stats.totalBoutiques)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Dons</span>
                    <span className="fw-bold">{stats.totalDons}</span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${calculatePercentage(stats.totalDons, stats.totalProduits + stats.totalDons + stats.totalEchanges + stats.totalBoutiques)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Échanges</span>
                    <span className="fw-bold">{stats.totalEchanges}</span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-warning"
                      role="progressbar"
                      style={{
                        width: `${calculatePercentage(stats.totalEchanges, stats.totalProduits + stats.totalDons + stats.totalEchanges + stats.totalBoutiques)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Boutiques</span>
                    <span className="fw-bold">{stats.totalBoutiques}</span>
                  </div>
                  <div className="progress" style={{ height: "10px" }}>
                    <div
                      className="progress-bar bg-info"
                      role="progressbar"
                      style={{
                        width: `${calculatePercentage(stats.totalBoutiques, stats.totalProduits + stats.totalDons + stats.totalEchanges + stats.totalBoutiques)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="row text-center mt-4 pt-3 border-top">
                  <div className="col-6 mb-3">
                    <div className="p-3 bg-primary bg-opacity-10 rounded">
                      <h4 className="fw-bold text-primary mb-1">
                        {stats.produitsPublies}
                      </h4>
                      <small className="text-muted">Produits publiés</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="p-3 bg-success bg-opacity-10 rounded">
                      <h4 className="fw-bold text-success mb-1">
                        {stats.donsPublies}
                      </h4>
                      <small className="text-muted">Dons publiés</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-warning bg-opacity-10 rounded">
                      <h4 className="fw-bold text-warning mb-1">
                        {stats.echangesPublies}
                      </h4>
                      <small className="text-muted">Échanges publiés</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-info bg-opacity-10 rounded">
                      <h4 className="fw-bold text-info mb-1">
                        {stats.boutiquesActive}
                      </h4>
                      <small className="text-muted">Boutiques actives</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="card shadow">
              <div className="card-header bg-white py-3">
                <h6 className="m-0 font-weight-bold text-primary">
                  Actions rapides
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <button className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3 border-2">
                      <Users size={24} className="mb-2" />
                      <span>Utilisateurs</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-success w-100 d-flex flex-column align-items-center py-3 border-2">
                      <Store size={24} className="mb-2" />
                      <span>Vendeurs</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-info w-100 d-flex flex-column align-items-center py-3 border-2">
                      <Package size={24} className="mb-2" />
                      <span>Contenu</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button className="btn btn-outline-warning w-100 d-flex flex-column align-items-center py-3 border-2">
                      <Download size={24} className="mb-2" />
                      <span>Rapports</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu récent */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header bg-white py-3 d-flex flex-row align-items-center justify-content-between">
                <h6 className="m-0 font-weight-bold text-primary">
                  Contenu récent
                </h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                    <Filter size={16} className="me-2" />
                    Filtrer
                  </button>
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                    <Search size={16} className="me-2" />
                    Rechercher
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Produits récents */}
                  <div className="col-md-4 mb-4 mb-md-0">
                    <h6 className="text-primary mb-3 d-flex align-items-center">
                      <Package size={18} className="me-2" />
                      Produits récents
                    </h6>
                    <div className="list-group list-group-flush">
                      {recentProduits.map((produit) => (
                        <div
                          key={produit.uuid}
                          className="list-group-item border-0 px-0 py-3"
                        >
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px" }}
                              >
                                {produit.image ? (
                                  <img
                                    src={produit.image}
                                    alt={produit.libelle}
                                    className="rounded"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNMTggMjJIMzBWMzBIMThWMjJaIiBmaWxsPSIjOTk5OTk5Ii8+PHBhdGggZD0iTTE0IDM0SDM0VjM2SDE0VjM0WiIgZmlsbD0iIzk5OTk5OSIvPjxwYXRoIGQ9Ik0xNiAyNkgyOFYyOEgxNlYyNloiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=";
                                    }}
                                  />
                                ) : (
                                  <Package size={20} className="text-muted" />
                                )}
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h6 className="mb-0 text-truncate fw-semibold">
                                {produit.libelle}
                              </h6>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-primary fw-bold">
                                  {formatCurrency(produit.prix)}
                                </small>
                                <div className="d-flex align-items-center">
                                  <span
                                    className={`badge bg-${getStatusClass(produit.disponible ? "disponible" : "indisponible")} me-1`}
                                  >
                                    {produit.disponible ? "Dispo" : "Indispo"}
                                  </span>
                                  <small className="text-muted">
                                    Qté: {produit.quantite}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dons récents */}
                  <div className="col-md-4 mb-4 mb-md-0">
                    <h6 className="text-success mb-3 d-flex align-items-center">
                      <Gift size={18} className="me-2" />
                      Dons récents
                    </h6>
                    <div className="list-group list-group-flush">
                      {recentDons.map((don) => (
                        <div
                          key={don.uuid}
                          className="list-group-item border-0 px-0 py-3"
                        >
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px" }}
                              >
                                {don.image ? (
                                  <img
                                    src={don.image}
                                    alt={don.nom}
                                    className="rounded"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNMjYgMjBIMjJWMjRIMThWMjhIMjJWMzJIMjZWMjhIMzBWMjRIMjZWMjBaIiBmaWxsPSIjOTk5OTk5Ii8+PC9zdmc+";
                                    }}
                                  />
                                ) : (
                                  <Gift size={20} className="text-muted" />
                                )}
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h6 className="mb-0 text-truncate fw-semibold">
                                {don.nom}
                              </h6>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  {don.type_don}
                                </small>
                                <div>
                                  <span
                                    className={`badge bg-${getStatusClass(don.estPublie ? "publie" : "non publie")} me-1`}
                                  >
                                    {don.estPublie ? "Publié" : "Non publié"}
                                  </span>
                                  <span
                                    className={`badge bg-${getStatusClass(don.disponible ? "disponible" : "indisponible")}`}
                                  >
                                    {don.disponible ? "Dispo" : "Indispo"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Échanges récents */}
                  <div className="col-md-4">
                    <h6 className="text-warning mb-3 d-flex align-items-center">
                      <RefreshCw size={18} className="me-2" />
                      Échanges récents
                    </h6>
                    <div className="list-group list-group-flush">
                      {recentEchanges.map((echange) => (
                        <div
                          key={echange.uuid}
                          className="list-group-item border-0 px-0 py-3"
                        >
                          <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: "50px", height: "50px" }}
                              >
                                {echange.image ? (
                                  <img
                                    src={echange.image}
                                    alt={echange.nomElementEchange}
                                    className="rounded"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNMTguNSAzMEwyOS41IDE5TDM1IDI0LjVMMzIuNSAyN0wyOS41IDI0TDIyIDMxLjVMMTguNSAzMFoiIGZpbGw9IiM5OTk5OTkiLz48L3N2Zz4=";
                                    }}
                                  />
                                ) : (
                                  <RefreshCw size={20} className="text-muted" />
                                )}
                              </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                              <h6 className="mb-0 text-truncate fw-semibold">
                                {echange.nomElementEchange}
                              </h6>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-primary fw-bold">
                                  {formatCurrency(echange.prix)}
                                </small>
                                <div>
                                  <span
                                    className={`badge bg-${getStatusClass(echange.statut)} me-1`}
                                  >
                                    {echange.statut}
                                  </span>
                                  <span
                                    className={`badge bg-${getStatusClass(echange.estPublie ? "publie" : "non publie")}`}
                                  >
                                    {echange.estPublie
                                      ? "Publié"
                                      : "Non publié"}
                                  </span>
                                </div>
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
      </div>

      {/* Footer */}
      <footer className="sticky-footer bg-white mt-4">
        <div className="container my-auto">
          <div className="copyright text-center my-auto">
            <span className="text-muted">
              © {new Date().getFullYear()} SONEC AFRICA - Dashboard Agent •
              Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")} à{" "}
              {new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </footer>
      {/* Styles additionnels */}
      <style jsx>{`
        .border-left-primary {
          border-left: 0.25rem solid #4e73df !important;
        }
        .border-left-success {
          border-left: 0.25rem solid #1cc88a !important;
        }
        .border-left-info {
          border-left: 0.25rem solid #36b9cc !important;
        }
        .border-left-warning {
          border-left: 0.25rem solid #f6c23e !important;
        }
        .border-left-danger {
          border-left: 0.25rem solid #e74a3b !important;
        }
        .card {
          border: none;
          border-radius: 0.5rem;
        }
        .table th {
          font-weight: 600;
          color: #5a5c69;
          border-top: none;
        }
        .list-group-item {
          transition: all 0.2s ease;
        }
        .list-group-item:hover {
          background-color: #f8f9fc;
          transform: translateY(-1px);
        }
        .avatar-sm {
          width: 40px;
          height: 40px;
        }
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .shadow-sm {
          box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
        }
        .sticky-footer {
          position: relative;
          bottom: 0;
          width: 100%;
          height: 60px;
          line-height: 60px;
        }
      `}</style>
    </div>
  );
};

export default AgentDashboard;
