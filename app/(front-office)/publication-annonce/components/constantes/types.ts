// components/PublishAdModal/types.ts

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface Category {
  label: string;
  value: string;
  uuid: string;
  icon: IconDefinition;
}

export interface AdTypeOption {
  id: "don" | "exchange" | "sale";
  title: string;
  description: string;
  icon: IconDefinition;
  color: string;
  gradient: string;
  iconBg: string;
}

// ✅ Corrigé : ajout de type_don et localisation
export interface DonData {
  description: string;
  type_don: string; // ← ajouté
  localisation: string; // ← ajouté
  lieu_retrait: string;
  image: File | null;
  categorie_uuid: string;
  numero: string;
  quantite: string;
  nom_donataire: string;
  titre: string;
  condition: string;
  disponibilite: string;
}

export interface EchangeData {
  nomElementEchange: string; // ✅ API attend ce champ
  numero: string; // ✅
  nom_initiateur: string; // ✅
  typeEchange: "produit" | "service";
  objetPropose: string;
  objetDemande: string;
  message: string;
  prix: string;
  categorie_uuid: string;
  image: File | null;
  quantite: string;
  type_destinataire: string; // ✅
}

export interface VenteData {
  boutiqueUuid: string;
  libelle: string;
  type: string;
  disponible: boolean;
  categorie_uuid: string;
  statut: "publie" | "brouillon";
  etoile: string;
  image: File | null;
  prix: string;
  quantite: string;
  description: string;
  lieu: string;
  condition: string;
  garantie: string;
}

export interface PublishAdModalProps {
  visible: boolean;
  onHide: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}
