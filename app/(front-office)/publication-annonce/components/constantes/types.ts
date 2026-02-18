// components/PublishAdModal/types.ts

import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// ============== TYPES DE BASE ==============
export type AdType = "don" | "exchange" | "sale";
export type SaleMode = "particulier" | "professionnel";
export type BoutiqueStatus = "en_review" | "actif" | "bloque" | "ferme";
export type ProductCondition =
  | "neuf"
  | "tresbon"
  | "bon"
  | "moyen"
  | "areparer";
export type DonCondition = "bon" | "moyen" | "usage";
export type EchangeType = "produit" | "service";
export type ProductStatus = "publie" | "brouillon";
export type Disponibilite = "immediate" | "planifiee";
export type DestinataireType = "autre" | "vendeur" | "utilisateur" | "agent";
export type ProfessionalFlow =
  | "conversion"
  | "boutique"
  | "produit"
  | "summary";

// ============== INTERFACES PRINCIPALES ==============
export interface PublishAdModalProps {
  visible: boolean;
  onHide: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  userData?: any;
  user?: UserInfo;
}

export interface AdTypeOption {
  id: AdType;
  title: string;
  description: string;
  icon: IconDefinition;
  color: string;
  gradient: string;
  iconBg: string;
}

export interface SaleModeOption {
  id: SaleMode;
  title: string;
  description: string;
  icon: IconDefinition;
  color: string;
  gradient: string;
  iconBg: string;
}

// ============== INTERFACES DE DONNÉES ==============

export interface DonData {
  titre: string; // Nom du don
  description: string;
  type_don: string; // Type de don (matériel, immatériel, etc.)
  localisation: string; // Localisation du don
  lieu_retrait: string; // Lieu de retrait
  image: File | null;
  categorie_uuid: string;
  numero: string; // Numéro de téléphone
  quantite: string;
  nom_donataire: string; // Nom de la personne qui fait le don
  condition: DonCondition | string; // État du don
  disponibilite: Disponibilite | string; // Disponibilité immédiate ou planifiée
  status?: "publie" | "brouillon"; // Statut de publication
}

export interface EchangeData {
  nomElementEchange: string; // Nom de l'élément à échanger
  numero: string; // Numéro de téléphone
  nom_initiateur: string; // Nom de la personne qui initie l'échange
  typeEchange: EchangeType; // Type d'échange (produit ou service)
  objetPropose: string; // Objet proposé
  objetDemande: string; // Objet demandé
  message: string; // Message supplémentaire
  prix: string; // Prix estimé (optionnel)
  categorie_uuid: string;
  image: File | null;
  quantite: string;
  type_destinataire: DestinataireType; // Type de destinataire
  condition?: ProductCondition; // État de l'objet
  status?: "publie" | "brouillon"; // Statut de publication
}

// types.ts
export interface VenteData {
  // Utilisez boutiqueUuid (camelCase) au lieu de boutique_uuid
  boutiqueUuid: string;
  libelle: string;
  type: string;
  disponible: boolean;
  categorie_uuid: string;
  statut: string;
  etoile: string;
  image: File | null;
  prix: string;
  quantite: string;
  description: string;
  lieu: string;
  condition: string;
  garantie: string;
  // Soit enlevez saleMode, soit rendez-le optionnel
  saleMode?: string;
}

export interface BoutiqueData {
  // Information de base
  type_boutique_uuid: string; // Type de boutique
  nom: string; // Nom de la boutique
  description: string; // Description

  // Médias
  logo: File | null;
  banniere: File | null;
  registre_commerce: File | null; // Facultatif

  // Métadonnées
  status?: "en_review" | "actif"; // Statut de la boutique
  createdUuid?: string; // UUID de la boutique créée
}

export interface TypeBoutique {
  uuid: string;
  libelle: string;
  description: string;
  icon: IconDefinition;
  is_default?: boolean;
  status?: "active" | "inactive";
}

// ============== INTERFACES D'API ==============

export interface Boutique {
  uuid: string;
  nom: string;
  description: string | null;
  logo: string | null;
  banniere: string | null;
  statut: BoutiqueStatus;
  vendeurUuid?: string;
  type_boutique: {
    uuid: string;
    libelle: string;
  };
  est_bloque: boolean;
  est_ferme: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  label: string;
  value: string;
  uuid: string;
  icon?: IconDefinition;
  type?: string; // Type de catégorie
  parent_uuid?: string | null; // Pour les sous-catégories
  children?: Category[]; // Sous-catégories
}

export interface ConditionOption {
  value: ProductCondition | DonCondition;
  label: string;
  description?: string;
  icon?: IconDefinition;
}

// ============== INTERFACES DE PROPS DE COMPOSANTS ==============

export interface DonFormProps {
  donData: DonData;
  categories: Category[];
  conditions: ConditionOption[];
  imagePreview: string | null;
  onChange: (newData: DonData) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  step: number;
}

export interface EchangeFormProps {
  echangeData: EchangeData;
  categories: Category[];
  conditions: ConditionOption[];
  imagePreview: string | null;
  onChange: (newData: EchangeData) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  step: number;
}

export interface VenteFormProps {
  venteData: VenteData;
  conditions: ConditionOption[];
  imagePreview: string | null;
  onChange: (newData: VenteData) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  step: number;
  saleMode: SaleMode;
  boutiqueCreated?: boolean;
  createdBoutiqueUuid?: string | null;
  // Add missing props
  boutiques: Boutique[];
  selectedBoutique: Boutique | null;
  onBoutiqueChange: (boutiqueUuid: string) => void;
  user: UserInfo | null | undefined; // Allow undefined
  validationErrors?: Record<string, string>; // ✅ AJOUTER CETTE LIGNE (déjà présente)
}
export interface BoutiqueFormProps {
  boutiqueData: BoutiqueData;
  onChange: (data: BoutiqueData) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
  step: number;
}

// ============== INTERFACES DES NOUVEAUX COMPOSANTS ==============

export interface SellerConversionFormProps {
  onBecomeSeller: () => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export interface ProductCreationFormProps {
  venteData: VenteData;
  setVenteData: (data: VenteData) => void;
  conditions: ConditionOption[];
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  saleMode: SaleMode;
  boutiqueCreated: boolean;
  createdBoutiqueUuid: string | null;
  onBack: () => void;
  onContinue: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
}

export interface BoutiqueCreationFormProps {
  onCreateBoutique: (data: BoutiqueData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  boutiqueCreated: boolean;
}

export interface SummaryStepProps {
  venteData: VenteData;
  saleMode: SaleMode;
  boutiqueCreated: boolean;
  createdBoutiqueUuid: string | null;
  onBack: () => void;
  onSubmit: () => Promise<boolean>;
  loading: boolean;
}

// ============== INTERFACES DE RÉPONSE API ==============

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
  error?: string;
}

export interface BoutiqueResponse {
  uuid: string;
  nom: string;
  description: string;
  logo?: string;
  banniere?: string;
  statut: BoutiqueStatus;
  type_boutique: TypeBoutique;
  est_bloque: boolean;
  est_ferme: boolean;
  message?: string;
}

export interface ProductResponse {
  uuid: string;
  libelle: string;
  prix: string;
  quantite: string;
  boutique_uuid?: string;
  message?: string;
}

export interface DonResponse {
  uuid: string;
  titre: string;
  description: string;
  message?: string;
}

export interface EchangeResponse {
  uuid: string;
  nomElementEchange: string;
  message?: string;
}

export interface SellerConversionResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  vendeur?: {
    uuid: string;
  };
}

// ============== INTERFACES D'ÉTAT ==============

export interface FormState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  success: string | null;
  submitted: boolean;
}

export interface ModalState {
  step: number;
  adType: AdType | null;
  saleMode: SaleMode | null;
  imagePreview: string | null;
  boutiqueCreated: boolean;
  createdBoutiqueUuid: string | null;
  isSeller: boolean;
  professionalFlow: ProfessionalFlow;
  completedSteps: number[];
}

export interface UserState {
  isLoggedIn: boolean;
  userData?: any;
  isSeller: boolean;
  userUuid?: string;
}

// ============== INTERFACES D'ÉVÉNEMENTS ==============

export interface ImageUploadEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    dataset: {
      field?: string;
    };
  };
}

export interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault: () => void;
}

// ============== INTERFACES DE VALIDATION ==============

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationErrors;
}

// ============== INTERFACES D'UTILISATEUR ==============

export interface UserInfo {
  uuid: string;
  email: string;
  nom_complet: string;
  type: string;
  role: string | undefined;
  temp_token?: string;
}

export interface SellerInfo {
  uuid: string;
  user_uuid: string;
  nom_complet: string;
  status: string;
  created_at: string;
}

// ============== INTERFACES DE CONFIGURATION ==============

export interface FormStep {
  number: number;
  title: string;
  description: string;
  icon: IconDefinition;
  isActive: boolean;
  isCompleted: boolean;
  isRequired: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "file"
    | "checkbox"
    | "radio";
  placeholder?: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRules;
  fieldType?: "input" | "select" | "textarea" | "file";
}

export interface StepperConfig {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  stepLabels: string[];
}

// ============== INTERFACES DE STYLE ==============

export interface ColorTheme {
  particulier: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  professionnel: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  don: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  exchange: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  success: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  warning: {
    primary: string;
    secondary: string;
    gradient: string;
  };
}

export interface StyleConfig {
  borderRadius: string;
  boxShadow: string;
  transition: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
  };
}

// ============== INTERFACES DE FONCTIONS ==============

export interface ApiFunctions {
  becomeSeller: (userUuid: string) => Promise<boolean>;
  createBoutique: (boutiqueData: BoutiqueData) => Promise<boolean>;
  createProduct: (venteData: VenteData) => Promise<boolean>;
  submitDon: (donData: DonData) => Promise<boolean>;
  submitEchange: (echangeData: EchangeData) => Promise<boolean>;
}

export interface NavigationFunctions {
  nextStep: () => void;
  prevStep: () => void;
  selectAdType: (type: AdType) => void;
  selectSaleMode: (mode: SaleMode) => void;
  resetForm: () => void;
}

// ============== INTERFACES DE CONTEXTE ==============

export interface PublishAdContextType {
  // États
  modalState: ModalState;
  userState: UserState;
  donData: DonData;
  echangeData: EchangeData;
  venteData: VenteData;
  boutiqueData: BoutiqueData;

  // Fonctions
  setModalState: (state: Partial<ModalState>) => void;
  setUserState: (state: Partial<UserState>) => void;
  setDonData: (data: Partial<DonData>) => void;
  setEchangeData: (data: Partial<EchangeData>) => void;
  setVenteData: (data: Partial<VenteData>) => void;
  setBoutiqueData: (data: Partial<BoutiqueData>) => void;

  // Actions
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: AdType,
  ) => void;
  handleRemoveImage: (type: AdType) => void;
  handleBecomeSeller: () => Promise<boolean>;
  handleCreateBoutique: () => Promise<boolean>;
  handleCreateProduct: () => Promise<boolean>;
  handleSubmitDon: () => Promise<boolean>;
  handleSubmitEchange: () => Promise<boolean>;
  handleFinalSubmission: () => Promise<boolean>;
}

// ============== INTERFACES D'UTILITAIRE ==============

export interface StepRendererProps {
  step: number;
  adType: AdType | null;
  saleMode: SaleMode | null;
  professionalFlow: ProfessionalFlow;
  isSeller: boolean;
  boutiqueCreated: boolean;
  createdBoutiqueUuid: string | null;
  donData: DonData;
  echangeData: EchangeData;
  venteData: VenteData;
  imagePreview: string | null;
  conditions: ConditionOption[];
  categories: Category[];
  loading: boolean;
  conversionLoading: boolean;
  boutiqueCreationLoading: boolean;
  submitError: string | null;
  isLoggedIn: boolean;
  onBack: () => void;
  onBecomeSeller: () => Promise<boolean>;
  onCreateBoutique: (data: BoutiqueData) => Promise<boolean>;
  onContinueProduct: () => Promise<void>;
  onFinalSubmit: () => Promise<boolean>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  setDonData: (data: DonData) => void;
  setEchangeData: (data: EchangeData) => void;
  setVenteData: (data: VenteData) => void;
}

export interface SummaryData {
  type: AdType;
  mode?: SaleMode;
  data: DonData | EchangeData | VenteData;
  boutiqueInfo?: {
    created: boolean;
    uuid?: string;
  };
  sellerInfo?: {
    isSeller: boolean;
  };
}

// ============== INTERFACES DE NOTIFICATION ==============

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

// ============== EXPORT DE TOUTES LES INTERFACES ==============

export type {
  // Alias pour compatibilité
  ProductCreationFormProps as ProductFormProps,
  //BoutiqueCreationFormProps as BoutiqueFormProps,
  SellerConversionFormProps as ConversionFormProps,
};
