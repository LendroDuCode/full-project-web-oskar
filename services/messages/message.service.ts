// services/messages/message.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Message,
  MessageCreateData,
  MessageUpdateData,
  MessageFilterParams,
  MessagePaginationParams,
  MessageStats,
  MessageValidationResult,
  Conversation,
  MessageTemplate,
  MessageCampagne,
  MessageDeliveryReport,
  MessagerieConfig,
  MessageWebhook,
} from "./message.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export const messageService = {
  // ==================== CRUD DES MESSAGES ====================

  /**
   * Récupère la liste des messages avec pagination et filtres
   */
  async getMessages(params?: MessagePaginationParams): Promise<{
    messages: Message[];
    total?: number;
    page?: number;
    pages?: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    if (params?.filters) {
      const filters = params.filters;
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.MESSAGERIE.RECEIVED}?${queryString}`
      : API_ENDPOINTS.MESSAGERIE.RECEIVED;

    try {
      const response = await api.get<ApiResponse<Message[]>>(endpoint);

      let messages: Message[] = [];
      let total = 0;
      let page = 1;
      let pages = 1;

      if (Array.isArray(response.data)) {
        messages = response.data;
        total = messages.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        messages = (response.data as any).data || [];
        total = (response.data as any).total || messages.length;
        page = (response.data as any).page || 1;
        pages = (response.data as any).pages || 1;
      }

      return { messages, total, page, pages };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des messages:", error);
      throw error;
    }
  },

  /**
   * Récupère un message spécifique par son UUID
   */
  async getMessage(uuid: string): Promise<Message> {
    try {
      const response = await api.get<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.DETAIL(uuid),
      );

      let messageData: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        messageData = (response.data as any).data;
      } else {
        messageData = response.data as Message;
      }

      return messageData;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du message:", error);
      throw error;
    }
  },

  /**
   * Envoie un nouveau message
   */
  async sendMessage(messageData: MessageCreateData): Promise<Message> {
    try {
      const response = await api.post<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.SEND,
        messageData,
      );

      let message: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        message = (response.data as any).data;
      } else {
        message = response.data as Message;
      }

      return message;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  },

  /**
   * Envoie un message public (sans authentification requise)
   */
  async sendPublicMessage(messageData: {
    nom: string;
    email: string;
    telephone?: string;
    sujet: string;
    message: string;
    reference_type?: string;
    reference_uuid?: string;
  }): Promise<Message> {
    try {
      const response = await api.post<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.PUBLIC_SEND,
        messageData,
      );

      let message: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        message = (response.data as any).data;
      } else {
        message = response.data as Message;
      }

      return message;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message public:", error);
      throw error;
    }
  },

  /**
   * Met à jour un message existant
   */
  async updateMessage(
    uuid: string,
    messageData: MessageUpdateData,
  ): Promise<Message> {
    try {
      const response = await api.put<ApiResponse<Message>>(
        `/messages/${uuid}`,
        messageData,
      );

      let updatedMessage: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedMessage = (response.data as any).data;
      } else {
        updatedMessage = response.data as Message;
      }

      return updatedMessage;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du message:", error);
      throw error;
    }
  },

  /**
   * Supprime un message
   */
  async deleteMessage(uuid: string): Promise<void> {
    try {
      await api.delete(`/messages/${uuid}`);
    } catch (error: any) {
      console.error("Erreur lors de la suppression du message:", error);
      throw error;
    }
  },

  // ==================== GESTION DES STATUTS ====================

  /**
   * Marque un message comme lu
   */
  async markAsRead(uuid: string): Promise<Message> {
    try {
      const response = await api.put<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.MARK_READ(uuid),
      );

      let message: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        message = (response.data as any).data;
      } else {
        message = response.data as Message;
      }

      return message;
    } catch (error: any) {
      console.error("Erreur lors du marquage du message comme lu:", error);
      throw error;
    }
  },

  /**
   * Marque un message comme non lu
   */
  async markAsUnread(uuid: string): Promise<Message> {
    try {
      const response = await api.put<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.MARK_UNREAD(uuid),
      );

      let message: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        message = (response.data as any).data;
      } else {
        message = response.data as Message;
      }

      return message;
    } catch (error: any) {
      console.error("Erreur lors du marquage du message comme non lu:", error);
      throw error;
    }
  },

  /**
   * Archive un message
   */
  async archiveMessage(uuid: string): Promise<Message> {
    try {
      const response = await api.put<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.ARCHIVE(uuid),
      );

      let message: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        message = (response.data as any).data;
      } else {
        message = response.data as Message;
      }

      return message;
    } catch (error: any) {
      console.error("Erreur lors de l'archivage du message:", error);
      throw error;
    }
  },

  // ==================== GESTION DES CONVERSATIONS ====================

  /**
   * Récupère la liste des conversations
   */
  async getConversations(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/conversations?${queryString}`
        : `/conversations`;

      const response = await api.get<ApiResponse<Conversation[]>>(endpoint);

      let conversations: Conversation[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        conversations = response.data;
        total = conversations.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        conversations = (response.data as any).data || [];
        total = (response.data as any).total || conversations.length;
      }

      return { conversations, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des conversations:", error);
      throw error;
    }
  },

  /**
   * Récupère une conversation spécifique avec ses messages
   */
  async getConversation(
    uuid: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{
    conversation: Conversation;
    messages: Message[];
    total: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/conversations/${uuid}?${queryString}`
        : `/conversations/${uuid}`;

      const response = await api.get<
        ApiResponse<{
          conversation: Conversation;
          messages: Message[];
          total: number;
        }>
      >(endpoint);

      let data = response.data as any;
      if (typeof response.data === "object" && "data" in response.data) {
        data = (response.data as any).data;
      }

      return {
        conversation: data?.conversation || {},
        messages: data?.messages || [],
        total: data?.total || 0,
      };
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de la conversation:",
        error,
      );
      throw error;
    }
  },

  /**
   * Répond à un message
   */
  async replyToMessage(
    parentUuid: string,
    replyData: {
      contenu: string;
      contenu_html?: string;
      pieces_jointes?: Array<{
        nom_fichier: string;
        url: string;
        type_mime: string;
        taille_octets: number;
      }>;
    },
  ): Promise<Message> {
    try {
      const response = await api.post<ApiResponse<Message>>(
        API_ENDPOINTS.MESSAGERIE.REPLY,
        {
          parent_uuid: parentUuid,
          ...replyData,
        },
      );

      let message: Message;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        message = (response.data as any).data;
      } else {
        message = response.data as Message;
      }

      return message;
    } catch (error: any) {
      console.error("Erreur lors de la réponse au message:", error);
      throw error;
    }
  },

  // ==================== STATISTIQUES ET RAPPORTS ====================

  /**
   * Récupère les statistiques des messages
   */
  async getMessageStats(filters?: MessageFilterParams): Promise<MessageStats> {
    try {
      const response = await api.get<ApiResponse<MessageStats>>(
        API_ENDPOINTS.MESSAGERIE.STATS,
        { params: filters },
      );

      let stats: MessageStats;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        stats = (response.data as any).data;
      } else {
        stats = response.data as MessageStats;
      }

      return stats;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  },

  /**
   * Valide un message avant envoi
   */
  async validateMessage(
    messageData: MessageCreateData,
  ): Promise<MessageValidationResult> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];
      const destinataires_invalides: Array<{ email: string; raison: string }> =
        [];

      // Validation de base
      if (!messageData.sujet?.trim()) {
        errors.push("Le sujet est obligatoire");
      }

      if (!messageData.contenu?.trim()) {
        errors.push("Le contenu est obligatoire");
      }

      if (!messageData.expediteur_email) {
        errors.push("L'email de l'expéditeur est obligatoire");
      }

      // Validation des destinataires
      if (
        !messageData.destinataires ||
        messageData.destinataires.length === 0
      ) {
        errors.push("Au moins un destinataire est requis");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        messageData.destinataires.forEach((dest) => {
          if (!emailRegex.test(dest.email)) {
            destinataires_invalides.push({
              email: dest.email,
              raison: "Format d'email invalide",
            });
          }
        });
      }

      // Validation des pièces jointes
      let tailleTotale = 0;
      if (messageData.pieces_jointes) {
        messageData.pieces_jointes.forEach((pj) => {
          tailleTotale += pj.taille_octets;
        });

        if (tailleTotale > 25 * 1024 * 1024) {
          // 25 MB
          warnings.push("La taille totale des pièces jointes dépasse 25MB");
        }
      }

      // Suggestions
      if (messageData.contenu.length < 50) {
        suggestions.push("Le contenu semble court, ajoutez plus de détails");
      }

      if (
        !messageData.pieces_jointes ||
        messageData.pieces_jointes.length === 0
      ) {
        suggestions.push(
          "Ajouter des pièces jointes peut enrichir votre message",
        );
      }

      const isValid =
        errors.length === 0 && destinataires_invalides.length === 0;

      return {
        isValid,
        errors,
        warnings,
        suggestions,
        destinataires_valides:
          messageData.destinataires.length - destinataires_invalides.length,
        destinataires_invalides,
        taille_pieces_jointes: tailleTotale,
      };
    } catch (error: any) {
      console.error("Erreur lors de la validation du message:", error);
      throw error;
    }
  },

  // ==================== GESTION DES TEMPLATES ====================

  /**
   * Récupère la liste des templates
   */
  async getTemplates(params?: {
    page?: number;
    limit?: number;
    categorie?: string;
    canal?: string;
  }): Promise<{ templates: MessageTemplate[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.categorie) queryParams.append("categorie", params.categorie);
      if (params?.canal) queryParams.append("canal", params.canal);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/message-templates?${queryString}`
        : `/message-templates`;

      const response = await api.get<ApiResponse<MessageTemplate[]>>(endpoint);

      let templates: MessageTemplate[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        templates = response.data;
        total = templates.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        templates = (response.data as any).data || [];
        total = (response.data as any).total || templates.length;
      }

      return { templates, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des templates:", error);
      throw error;
    }
  },

  /**
   * Récupère un template spécifique
   */
  async getTemplate(uuid: string): Promise<MessageTemplate> {
    try {
      const response = await api.get<ApiResponse<MessageTemplate>>(
        `/message-templates/${uuid}`,
      );

      let template: MessageTemplate;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        template = (response.data as any).data;
      } else {
        template = response.data as MessageTemplate;
      }

      return template;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du template:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau template
   */
  async createTemplate(
    templateData: Omit<
      MessageTemplate,
      "uuid" | "date_creation" | "date_modification" | "utilisation_count"
    >,
  ): Promise<MessageTemplate> {
    try {
      const response = await api.post<ApiResponse<MessageTemplate>>(
        `/message-templates`,
        templateData,
      );

      let template: MessageTemplate;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        template = (response.data as any).data;
      } else {
        template = response.data as MessageTemplate;
      }

      return template;
    } catch (error: any) {
      console.error("Erreur lors de la création du template:", error);
      throw error;
    }
  },

  // ==================== GESTION DES CAMPAGNES ====================

  /**
   * Récupère la liste des campagnes
   */
  async getCampagnes(params?: {
    page?: number;
    limit?: number;
    statut?: string;
  }): Promise<{ campagnes: MessageCampagne[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.statut) queryParams.append("statut", params.statut);

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/campagnes?${queryString}` : `/campagnes`;

      const response = await api.get<ApiResponse<MessageCampagne[]>>(endpoint);

      let campagnes: MessageCampagne[] = [];
      let total = 0;

      if (Array.isArray(response.data)) {
        campagnes = response.data;
        total = campagnes.length;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        campagnes = (response.data as any).data || [];
        total = (response.data as any).total || campagnes.length;
      }

      return { campagnes, total };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des campagnes:", error);
      throw error;
    }
  },

  // ==================== CONFIGURATION ====================

  /**
   * Récupère la configuration de la messagerie
   */
  async getConfig(): Promise<MessagerieConfig> {
    try {
      const response =
        await api.get<ApiResponse<MessagerieConfig>>(`/messagerie/config`);

      let config: MessagerieConfig;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as MessagerieConfig;
      }

      return config;
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération de la configuration:",
        error,
      );
      throw error;
    }
  },

  /**
   * Met à jour la configuration de la messagerie
   */
  async updateConfig(
    configData: Partial<MessagerieConfig>,
  ): Promise<MessagerieConfig> {
    try {
      const response = await api.put<ApiResponse<MessagerieConfig>>(
        `/messagerie/config`,
        configData,
      );

      let config: MessagerieConfig;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        config = (response.data as any).data;
      } else {
        config = response.data as MessagerieConfig;
      }

      return config;
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour de la configuration:",
        error,
      );
      throw error;
    }
  },

  // ==================== WEBHOOKS ====================

  /**
   * Récupère la liste des webhooks
   */
  async getWebhooks(): Promise<MessageWebhook[]> {
    try {
      const response =
        await api.get<ApiResponse<MessageWebhook[]>>(`/messagerie/webhooks`);

      let webhooks: MessageWebhook[] = [];
      if (Array.isArray(response.data)) {
        webhooks = response.data;
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        webhooks = (response.data as any).data || [];
      }

      return webhooks;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des webhooks:", error);
      throw error;
    }
  },

  // ==================== UTILITAIRES ====================

  /**
   * Teste la connexion au service de messagerie
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response =
        await api.get<ApiResponse<{ success: boolean; message: string }>>(
          `/messagerie/test`,
        );

      let result: { success: boolean; message: string };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean; message: string };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors du test de connexion:", error);
      throw error;
    }
  },

  /**
   * Envoie un email de test
   */
  async sendTestEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<
        ApiResponse<{ success: boolean; message: string }>
      >(`/messagerie/test-email`, { email });

      let result: { success: boolean; message: string };
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        result = (response.data as any).data;
      } else {
        result = response.data as { success: boolean; message: string };
      }

      return result;
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'email de test:", error);
      throw error;
    }
  },
};
