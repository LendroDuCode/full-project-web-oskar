// services/agents/agent.service.ts
import { api } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  Agent,
  AgentCreateData,
  AgentUpdateData,
  PaginationParams,
  AgentStats,
  AgentPerformance,
} from "./agent.types";

export interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
  count?: number;
}

export const agentService = {
  // ==================== CRUD Operations ====================

  async getAgents(
    params?: PaginationParams,
  ): Promise<{ agents: Agent[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.departement)
      queryParams.append("departement", params.departement);
    if (params?.poste) queryParams.append("poste", params.poste);
    if (params?.statut_contrat)
      queryParams.append("statut_contrat", params.statut_contrat);
    if (params?.est_bloque !== undefined)
      queryParams.append("est_bloque", params.est_bloque.toString());
    if (params?.est_verifie !== undefined)
      queryParams.append("est_verifie", params.est_verifie.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.AGENTS.LIST}?${queryString}`
      : API_ENDPOINTS.ADMIN.AGENTS.LIST;

    console.log("📡 Fetching agents from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Agent[]>>(endpoint);

      console.log("✅ Service response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
      });

      // Vérifier la structure de la réponse
      if (Array.isArray(response.data)) {
        // L'API retourne directement un tableau
        console.log(
          "📊 API returned array directly, count:",
          response.data.length,
        );
        return {
          agents: response.data,
          count: response.data.length,
        };
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        // L'API retourne { data: [...], status: "success" }
        console.log(
          "📊 API returned wrapped data, count:",
          (response.data as any).data?.length || 0,
        );
        return {
          agents: (response.data as any).data || [],
          count:
            (response.data as any).count ||
            (response.data as any).data?.length ||
            0,
        };
      } else {
        console.warn("⚠️ Unexpected response format:", response.data);
        return { agents: [], count: 0 };
      }
    } catch (error: any) {
      console.error("🚨 Error in agentService.getAgents:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getAgent(uuid: string): Promise<Agent> {
    try {
      console.log("🔍 Fetching agent:", uuid);

      const response = await api.get<ApiResponse<Agent>>(
        API_ENDPOINTS.ADMIN.AGENTS.DETAIL(uuid),
      );

      console.log("✅ Agent response:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        hasWrappedData:
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data,
      });

      let agentData: Agent;

      // Vérifier la structure de la réponse
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        // Structure: { data: {...}, status: "success" }
        agentData = (response.data as any).data;
        console.log("📊 Using wrapped data structure");
      } else if (response.data && (response.data as any).uuid) {
        // Structure: l'agent directement
        agentData = response.data as Agent;
        console.log("📊 Using direct agent structure");
      } else {
        console.error("❌ Invalid agent data structure:", response.data);
        throw new Error("Structure de données agent invalide");
      }

      if (!agentData || !agentData.uuid) {
        throw new Error("Agent non trouvé");
      }

      console.log("✅ Agent found:", agentData.nom, agentData.prenoms);
      return agentData;
    } catch (error: any) {
      console.error("❌ Error fetching agent:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  async createAgent(agentData: AgentCreateData): Promise<Agent> {
    try {
      console.log("🆕 Creating agent:", agentData.email);

      const response = await api.post<ApiResponse<Agent>>(
        API_ENDPOINTS.ADMIN.AGENTS.CREATE,
        agentData,
      );

      console.log("✅ Agent creation response:", response.data);

      // Vérifier la structure de la réponse
      let createdAgent: Agent;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        createdAgent = (response.data as any).data;
      } else {
        createdAgent = response.data as Agent;
      }

      if (!createdAgent || !createdAgent.uuid) {
        throw new Error("Échec de la création de l'agent");
      }

      return createdAgent;
    } catch (error: any) {
      console.error("❌ Error creating agent:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async updateAgent(uuid: string, agentData: AgentUpdateData): Promise<Agent> {
    try {
      console.log("✏️ Updating agent:", uuid);

      const response = await api.put<ApiResponse<Agent>>(
        API_ENDPOINTS.ADMIN.AGENTS.UPDATE(uuid),
        agentData,
      );

      console.log("✅ Agent update response:", response.data);

      // Vérifier la structure de la réponse
      let updatedAgent: Agent;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedAgent = (response.data as any).data;
      } else {
        updatedAgent = response.data as Agent;
      }

      return updatedAgent;
    } catch (error: any) {
      console.error("❌ Error updating agent:", error);
      throw error;
    }
  },

  async deleteAgent(uuid: string): Promise<void> {
    try {
      console.log("🗑️ Deleting agent:", uuid);
      await api.delete(API_ENDPOINTS.ADMIN.AGENTS.DELETE(uuid));
      console.log("✅ Agent deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting agent:", error);
      throw error;
    }
  },

  // ==================== Status Management ====================

  async blockAgent(uuid: string): Promise<Agent> {
    try {
      console.log("🚫 Blocking agent:", uuid);

      const response = await api.post<ApiResponse<Agent>>(
        API_ENDPOINTS.ADMIN.AGENTS.BLOCK(uuid),
      );

      // Vérifier la structure de la réponse
      let blockedAgent: Agent;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        blockedAgent = (response.data as any).data;
      } else {
        blockedAgent = response.data as Agent;
      }

      console.log("✅ Agent blocked successfully");
      return blockedAgent;
    } catch (error: any) {
      console.error("❌ Error blocking agent:", error);
      throw error;
    }
  },

  async unblockAgent(uuid: string): Promise<Agent> {
    try {
      console.log("✅ Unblocking agent:", uuid);

      const response = await api.post<ApiResponse<Agent>>(
        API_ENDPOINTS.ADMIN.AGENTS.UNBLOCK(uuid),
      );

      // Vérifier la structure de la réponse
      let unblockedAgent: Agent;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        unblockedAgent = (response.data as any).data;
      } else {
        unblockedAgent = response.data as Agent;
      }

      console.log("✅ Agent unblocked successfully");
      return unblockedAgent;
    } catch (error: any) {
      console.error("❌ Error unblocking agent:", error);
      throw error;
    }
  },

  async restoreAgent(uuid: string): Promise<Agent> {
    try {
      console.log("↩️ Restoring agent:", uuid);

      const response = await api.delete<ApiResponse<Agent>>(
        API_ENDPOINTS.ADMIN.AGENTS.RESTORE(uuid),
      );

      // Vérifier la structure de la réponse
      let restoredAgent: Agent;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        restoredAgent = (response.data as any).data;
      } else {
        restoredAgent = response.data as Agent;
      }

      console.log("✅ Agent restored successfully");
      return restoredAgent;
    } catch (error: any) {
      console.error("❌ Error restoring agent:", error);
      throw error;
    }
  },

  // ==================== Specialized Lists ====================

  async getAgentsBloques(
    params?: PaginationParams,
  ): Promise<{ agents: Agent[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.AGENTS.BLOCKED}?${queryString}`
      : API_ENDPOINTS.ADMIN.AGENTS.BLOCKED;

    console.log("📡 Fetching blocked agents from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Agent[]>>(endpoint);

      // Gestion similaire à getAgents
      if (Array.isArray(response.data)) {
        return { agents: response.data, count: response.data.length };
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return {
          agents: (response.data as any).data || [],
          count:
            (response.data as any).count ||
            (response.data as any).data?.length ||
            0,
        };
      }
      return { agents: [], count: 0 };
    } catch (error: any) {
      console.error("❌ Error fetching blocked agents:", error);
      throw error;
    }
  },

  async getAgentsSupprimes(
    params?: PaginationParams,
  ): Promise<{ agents: Agent[]; count?: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ADMIN.AGENTS.DELETED}?${queryString}`
      : API_ENDPOINTS.ADMIN.AGENTS.DELETED;

    console.log("📡 Fetching deleted agents from:", endpoint);

    try {
      const response = await api.get<ApiResponse<Agent[]>>(endpoint);

      // Gestion similaire à getAgents
      if (Array.isArray(response.data)) {
        return { agents: response.data, count: response.data.length };
      } else if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        return {
          agents: (response.data as any).data || [],
          count:
            (response.data as any).count ||
            (response.data as any).data?.length ||
            0,
        };
      }
      return { agents: [], count: 0 };
    } catch (error: any) {
      console.error("❌ Error fetching deleted agents:", error);
      throw error;
    }
  },

  async getAgentsByDepartement(departement: string): Promise<Agent[]> {
    try {
      console.log("📋 Fetching agents by department:", departement);

      const { agents } = await this.getAgents({
        departement,
        limit: 100,
      });

      return agents;
    } catch (error: any) {
      console.error("❌ Error fetching agents by department:", error);
      throw error;
    }
  },

  async getSuperviseurs(): Promise<Agent[]> {
    try {
      console.log("👨‍💼 Fetching superviseurs");

      // Cette logique peut être adaptée selon votre API
      const { agents } = await this.getAgents({
        poste: "superviseur",
        limit: 100,
      });

      return agents;
    } catch (error: any) {
      console.error("❌ Error fetching superviseurs:", error);
      throw error;
    }
  },

  // ==================== Export ====================

  async exportAgents(format: "pdf" | "csv" = "pdf"): Promise<Blob> {
    try {
      console.log("📄 Exporting agents in", format, "format");

      const endpoint =
        format === "pdf"
          ? API_ENDPOINTS.ADMIN.AGENTS.EXPORT_PDF
          : API_ENDPOINTS.ADMIN.AGENTS.EXPORT_PDF; // À adapter si vous avez d'autres formats

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      console.log("✅ Agents exported successfully");
      return response;
    } catch (error: any) {
      console.error("❌ Error exporting agents:", error);
      throw error;
    }
  },

  // ==================== Statistics & Reports ====================

  async getAgentStats(): Promise<AgentStats> {
    try {
      console.log("📊 Fetching agent statistics");

      // Cette route peut ne pas exister, à adapter selon votre API
      // Pour l'instant, nous allons simuler avec les données existantes
      const { agents } = await this.getAgents({ limit: 1000 });
      const { agents: blockedAgents } = await this.getAgentsBloques();
      const { agents: deletedAgents } = await this.getAgentsSupprimes();

      // Calculer les statistiques par département
      const par_departement: Record<string, number> = {};
      const par_poste: Record<string, number> = {};
      const par_statut_contrat: Record<string, number> = {};

      agents.forEach((agent) => {
        // Statistiques par département
        const dept = agent.departement || "Non spécifié";
        par_departement[dept] = (par_departement[dept] || 0) + 1;

        // Statistiques par poste
        const poste = agent.poste || "Non spécifié";
        par_poste[poste] = (par_poste[poste] || 0) + 1;

        // Statistiques par statut de contrat
        const statut = agent.statut_contrat || "Non spécifié";
        par_statut_contrat[statut] = (par_statut_contrat[statut] || 0) + 1;
      });

      const stats: AgentStats = {
        total_agents: agents.length,
        agents_actifs: agents.filter((a) => !a.est_bloque && !a.is_deleted)
          .length,
        agents_bloques: blockedAgents.length,
        agents_supprimes: deletedAgents.length,
        par_departement,
        par_poste,
        par_statut_contrat,
      };

      console.log("✅ Agent stats calculated:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error fetching agent stats:", error);
      throw error;
    }
  },

  async getAgentPerformance(uuid: string): Promise<AgentPerformance> {
    try {
      console.log("📈 Fetching agent performance:", uuid);

      // Cette route peut ne pas exister, à adapter selon votre API
      // Pour l'instant, nous allons retourner des données simulées
      const agent = await this.getAgent(uuid);

      const performance: AgentPerformance = {
        uuid: agent.uuid,
        nom: agent.nom,
        prenoms: agent.prenoms,
        total_taches: Math.floor(Math.random() * 100),
        taches_terminees: Math.floor(Math.random() * 80),
        taches_en_cours: Math.floor(Math.random() * 20),
        taux_reussite: Math.floor(Math.random() * 100),
        evaluations_moyenne: Math.floor(Math.random() * 5),
        date_derniere_evaluation: new Date().toISOString().split("T")[0],
      };

      performance.taux_reussite = Math.round(
        (performance.taches_terminees / Math.max(performance.total_taches, 1)) *
          100,
      );

      console.log("✅ Agent performance calculated:", performance);
      return performance;
    } catch (error: any) {
      console.error("❌ Error fetching agent performance:", error);
      throw error;
    }
  },

  async getTopPerformers(limit: number = 10): Promise<AgentPerformance[]> {
    try {
      console.log("🏆 Fetching top performers, limit:", limit);

      // Récupérer tous les agents
      const { agents } = await this.getAgents({ limit: 100 });

      // Générer des performances simulées pour chaque agent
      const performances = await Promise.all(
        agents.slice(0, limit).map(async (agent) => {
          return this.getAgentPerformance(agent.uuid);
        }),
      );

      // Trier par taux de réussite
      performances.sort((a, b) => b.taux_reussite - a.taux_reussite);

      console.log("✅ Top performers fetched:", performances.length);
      return performances;
    } catch (error: any) {
      console.error("❌ Error fetching top performers:", error);
      throw error;
    }
  },

  // ==================== Utility Methods ====================

  async updateAgentPassword(uuid: string, newPassword: string): Promise<void> {
    try {
      console.log("🔑 Updating agent password:", uuid);

      // À adapter selon votre API
      await api.put(`/auth/${uuid}/password`, {
        password: newPassword,
      });

      console.log("✅ Agent password updated successfully");
    } catch (error: any) {
      console.error("❌ Error updating agent password:", error);
      throw error;
    }
  },

  async updateAgentProfile(
    uuid: string,
    profileData: Partial<Agent>,
  ): Promise<Agent> {
    try {
      console.log("👤 Updating agent profile:", uuid);

      // À adapter selon votre API
      const response = await api.put<ApiResponse<Agent>>(
        `/auth/${uuid}/profile`,
        profileData,
      );

      // Vérifier la structure de la réponse
      let updatedAgent: Agent;
      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        updatedAgent = (response.data as any).data;
      } else {
        updatedAgent = response.data as Agent;
      }

      console.log("✅ Agent profile updated successfully");
      return updatedAgent;
    } catch (error: any) {
      console.error("❌ Error updating agent profile:", error);
      throw error;
    }
  },

  // ==================== Debug & Test Methods ====================

  async testEndpoint(endpoint: string): Promise<any> {
    try {
      console.log("🧪 Testing endpoint:", endpoint);

      const response = await api.get(endpoint);

      console.log("✅ Test endpoint response:", {
        endpoint,
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keys: response.data ? Object.keys(response.data) : "no data",
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Test endpoint error:", {
        endpoint,
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async pingAgentService(): Promise<boolean> {
    try {
      console.log("🏓 Pinging agent service...");

      await this.getAgents({ limit: 1 });

      console.log("✅ Agent service is operational");
      return true;
    } catch (error: any) {
      console.error("❌ Agent service ping failed:", error.message);
      return false;
    }
  },

  // ==================== Search & Filter ====================

  async searchAgents(
    query: string,
    params?: PaginationParams,
  ): Promise<Agent[]> {
    try {
      console.log("🔍 Searching agents with query:", query);

      const { agents } = await this.getAgents({
        ...params,
        search: query,
      });

      console.log("✅ Search completed, found:", agents.length, "agents");
      return agents;
    } catch (error: any) {
      console.error("❌ Error searching agents:", error);
      throw error;
    }
  },

  async filterAgents(filters: {
    departement?: string;
    poste?: string;
    statut_contrat?: string;
    est_bloque?: boolean;
    est_verifie?: boolean;
    date_embauche_start?: string;
    date_embauche_end?: string;
  }): Promise<Agent[]> {
    try {
      console.log("🔍 Filtering agents with filters:", filters);

      const { agents } = await this.getAgents({
        departement: filters.departement,
        poste: filters.poste,
        statut_contrat: filters.statut_contrat,
        est_bloque: filters.est_bloque,
        est_verifie: filters.est_verifie,
        limit: 1000,
      });

      // Filtrer par date d'embauche si spécifié
      let filteredAgents = agents;

      if (filters.date_embauche_start || filters.date_embauche_end) {
        filteredAgents = agents.filter((agent) => {
          if (!agent.date_embauche) return false;

          const embaucheDate = new Date(agent.date_embauche);

          if (
            filters.date_embauche_start &&
            embaucheDate < new Date(filters.date_embauche_start)
          ) {
            return false;
          }

          if (
            filters.date_embauche_end &&
            embaucheDate > new Date(filters.date_embauche_end)
          ) {
            return false;
          }

          return true;
        });
      }

      console.log(
        "✅ Filter completed, found:",
        filteredAgents.length,
        "agents",
      );
      return filteredAgents;
    } catch (error: any) {
      console.error("❌ Error filtering agents:", error);
      throw error;
    }
  },

  // ==================== Validation Methods ====================

  async validateAgentEmail(
    email: string,
  ): Promise<{ valid: boolean; exists: boolean }> {
    try {
      console.log("📧 Validating agent email:", email);

      // Vérifier le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(email);

      if (!valid) {
        return { valid: false, exists: false };
      }

      // Vérifier si l'email existe déjà
      const { agents } = await this.searchAgents(email);
      const exists = agents.some(
        (agent) => agent.email.toLowerCase() === email.toLowerCase(),
      );

      return { valid: true, exists };
    } catch (error: any) {
      console.error("❌ Error validating agent email:", error);
      throw error;
    }
  },

  async validateAgentMatricule(
    matricule: string,
  ): Promise<{ valid: boolean; exists: boolean }> {
    try {
      console.log("#️⃣ Validating agent matricule:", matricule);

      // Vérifier si le matricule est valide (non vide)
      const valid = matricule.trim().length > 0;

      if (!valid) {
        return { valid: false, exists: false };
      }

      // Vérifier si le matricule existe déjà
      const { agents } = await this.searchAgents(matricule);
      const exists = agents.some((agent) => agent.matricule === matricule);

      return { valid: true, exists };
    } catch (error: any) {
      console.error("❌ Error validating agent matricule:", error);
      throw error;
    }
  },
};
