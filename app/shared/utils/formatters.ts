export const formatPrice = (
  price: number | string | null | undefined,
): string => {
  if (price === null || price === undefined || price === "") {
    return "Gratuit";
  }

  const num = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(num)) {
    return "Gratuit";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date: string | Date | null): string => {
  if (!date) return "Date inconnue";

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return "Date invalide";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return formatDate(d);
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + "...";
};

export const getStatusLabel = (status: string | undefined | null): string => {
  // Vérifier si status est undefined, null ou vide
  if (!status) {
    return "Statut inconnu";
  }

  // S'assurer que status est une chaîne
  const statusStr = String(status);

  const statusMap: Record<string, string> = {
    publie: "Publié",
    published: "Publié",
    "en-attente": "En attente",
    en_attente: "En attente",
    pending: "En attente",
    disponible: "Disponible",
    available: "Disponible",
    valide: "Validé",
    validated: "Validé",
    refuse: "Refusé",
    rejected: "Refusé",
    bloque: "Bloqué",
    blocked: "Bloqué",
    brouillon: "Brouillon",
    draft: "Brouillon",
    active: "Actif",
    inactive: "Inactif",
    sold: "Vendu",
    exchanged: "Échangé",
    donated: "Donné",
    closed: "Fermé",
    expired: "Expiré",
    cancelled: "Annulé",
  };

  // Utiliser toLowerCase avec une vérification
  return statusMap[statusStr.toLowerCase()] || statusStr;
};

export const getTypeLabel = (type: string | undefined | null): string => {
  if (!type) {
    return "Type inconnu";
  }

  const typeStr = String(type);

  const typeMap: Record<string, string> = {
    produit: "Produit",
    product: "Produit",
    don: "Don",
    echange: "Échange",
    exchange: "Échange",
    annonce: "Annonce",
    advertisement: "Annonce",
    service: "Service",
    event: "Événement",
    property: "Immobilier",
    vehicle: "Véhicule",
  };

  return typeMap[typeStr.toLowerCase()] || typeStr;
};

// app/shared/utils/annonceTransformers.ts

export const transformProduit = (item: any) => {
  // Récupérer les données selon la structure de l'API
  const produitData = item.data?.produits?.[0] || item.data?.produit || item;

  return {
    uuid: produitData.uuid,
    title: produitData.libelle || produitData.nom || "Produit sans nom",
    description: produitData.description,
    image: produitData.image || `https://via.placeholder.com/64?text=P`,
    type: "produit" as const,
    status:
      produitData.statut?.toLowerCase() ||
      (produitData.estPublie ? "publie" : "en-attente"),
    date:
      produitData.createdAt ||
      produitData.updatedAt ||
      new Date().toISOString(),
    price: produitData.prix,
    quantity: produitData.quantite,
    estPublie: produitData.estPublie || false,
    estBloque: produitData.estBloque || produitData.est_bloque || false,
    seller: {
      name:
        produitData.vendeur?.nom ||
        produitData.utilisateur?.nom ||
        produitData.source?.infos?.nom ||
        "Inconnu",
      avatar:
        produitData.vendeur?.avatar ||
        produitData.utilisateur?.avatar ||
        produitData.source?.infos?.avatar,
      isPro: !!produitData.boutique?.nom || false,
      type: produitData.source?.type || "inconnu",
    },
    category: produitData.categorie?.libelle || produitData.categorie,
    originalData: produitData,
  };
};

export const transformDon = (item: any) => {
  const donData = item.data?.[0] || item.data || item;

  return {
    uuid: donData.uuid,
    title: donData.nom || donData.titre || "Don sans nom",
    description: donData.description,
    image: donData.image || `https://via.placeholder.com/64?text=D`,
    type: "don" as const,
    status: donData.statut?.toLowerCase() || "en-attente",
    date: donData.date_debut || new Date().toISOString(),
    price: donData.prix,
    quantity: donData.quantite,
    estPublie: donData.estPublie || false,
    estBloque: donData.est_bloque || false,
    seller: {
      name:
        donData.utilisateur ||
        donData.vendeur ||
        donData.nom_donataire ||
        "Donateur inconnu",
      type: donData.utilisateur ? "utilisateur" : "vendeur",
    },
    category: donData.categorie,
    originalData: donData,
  };
};

export const transformEchange = (item: any) => {
  const echangeData = item.data?.[0] || item.data || item;

  return {
    uuid: echangeData.uuid,
    title:
      echangeData.nomElementEchange ||
      echangeData.titre ||
      `${echangeData.objetPropose || ""} vs ${echangeData.objetDemande || ""}`.trim() ||
      "Échange sans nom",
    description: echangeData.description || echangeData.message,
    image: echangeData.image || `https://via.placeholder.com/64?text=E`,
    type: "echange" as const,
    status: echangeData.statut?.toLowerCase() || "en-attente",
    date:
      echangeData.dateProposition ||
      echangeData.createdAt ||
      new Date().toISOString(),
    price: echangeData.prix,
    quantity: echangeData.quantite,
    estPublie: echangeData.estPublie || false,
    estBloque: echangeData.estBloque || false,
    seller: {
      name:
        echangeData.utilisateur ||
        echangeData.vendeur ||
        echangeData.nom_initiateur ||
        "Initié par",
      type: echangeData.typeDestinataire || "inconnu",
    },
    category: echangeData.categorie,
    originalData: echangeData,
  };
};
