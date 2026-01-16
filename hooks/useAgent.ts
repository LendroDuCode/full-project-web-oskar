// hooks/useAgents.ts
import { useState, useCallback } from "react";
import { agentService } from "@/services/agents/agent.service";
import type {
  Agent,
  AgentCreateData,
  AgentUpdateData,
  PaginationParams,
  AgentStats,
  AgentPerformance,
} from "@/services/agents/agent.types";

export const useAgents = () => {
  // États pour les données
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [performance, setPerformance] = useState<AgentPerformance | null>(null);
  const [topPerformers, setTopPerformers] = useState<AgentPerformance[]>([]);

  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // ==================== Fonctions de récupération ====================

  // Fonction utilitaire pour gérer les réponses
  const handleApiResponse = useCallback((response: any) => {
    if (response && typeof response === "object") {
      // Format: { agents: Agent[], count?: number }
      if ("agents" in response && Array.isArray(response.agents)) {
        return {
          agents: response.agents,
          count: response.count || response.agents.length,
        };
      }
      // Format: { data: Agent[], count?: number } (compatibilité)
      if ("data" in response && Array.isArray(response.data)) {
        return {
          agents: response.data,
          count: response.count || response.data.length,
        };
      }
    }

    // Format inattendu
    console.warn("⚠️ Format de réponse inattendu:", response);
    return { agents: [], count: 0 };
  }, []);

  // Charger tous les agents (actifs)
  const fetchAgents = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching agents with params:", params);

        const response = await agentService.getAgents(params || {});
        const { agents: agentsData, count } = handleApiResponse(response);

        setAgents(agentsData);

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: count || 0,
          pages: Math.ceil((count || 0) / currentLimit) || 1,
        }));

        console.log("✅ Agents state updated:", {
          count: agentsData.length,
          total: count,
          pages: Math.ceil((count || 0) / currentLimit),
        });
      } catch (err: any) {
        console.error("❌ Error fetching agents:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des agents",
        );
        setAgents([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, handleApiResponse],
  );

  // Charger les agents bloqués
  const fetchBlockedAgents = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching blocked agents...");

        const response = await agentService.getAgentsBloques(params || {});
        const { agents: agentsData, count } = handleApiResponse(response);

        setAgents(agentsData);

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: count || 0,
          pages: Math.ceil((count || 0) / currentLimit) || 1,
        }));

        console.log("✅ Blocked agents state updated:", {
          count: agentsData.length,
          total: count,
        });
      } catch (err: any) {
        console.error("❌ Error fetching blocked agents:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des agents bloqués",
        );
        setAgents([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, handleApiResponse],
  );

  // Charger les agents supprimés
  const fetchDeletedAgents = useCallback(
    async (params?: PaginationParams) => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching deleted agents...");

        const response = await agentService.getAgentsSupprimes(params || {});
        const { agents: agentsData, count } = handleApiResponse(response);

        setAgents(agentsData);

        const currentPage = params?.page || pagination.page;
        const currentLimit = params?.limit || pagination.limit;

        setPagination((prev) => ({
          ...prev,
          page: currentPage,
          limit: currentLimit,
          total: count || 0,
          pages: Math.ceil((count || 0) / currentLimit) || 1,
        }));

        console.log("✅ Deleted agents state updated:", {
          count: agentsData.length,
          total: count,
        });
      } catch (err: any) {
        console.error("❌ Error fetching deleted agents:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du chargement des agents supprimés",
        );
        setAgents([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, handleApiResponse],
  );

  // Charger un agent spécifique
  const fetchAgent = useCallback(async (uuid: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching agent:", uuid);

      const agentData = await agentService.getAgent(uuid);
      setAgent(agentData);

      console.log("✅ Agent state updated:", agentData.nom, agentData.prenoms);
    } catch (err: any) {
      console.error("❌ Error fetching agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement de l'agent",
      );
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Fonctions de statistiques ====================

  const fetchAgentStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("📊 Fetching agent statistics...");

      const statsData = await agentService.getAgentStats();
      setStats(statsData);

      console.log("✅ Agent stats updated:", statsData);
    } catch (err: any) {
      console.error("❌ Error fetching agent stats:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des statistiques",
      );
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAgentPerformance = useCallback(async (uuid: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("📈 Fetching agent performance:", uuid);

      const performanceData = await agentService.getAgentPerformance(uuid);
      setPerformance(performanceData);

      console.log("✅ Agent performance updated:", performanceData);
    } catch (err: any) {
      console.error("❌ Error fetching agent performance:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des performances",
      );
      setPerformance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopPerformers = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🏆 Fetching top performers, limit:", limit);

      const topPerformersData = await agentService.getTopPerformers(limit);
      setTopPerformers(topPerformersData);

      console.log("✅ Top performers updated:", topPerformersData.length);
    } catch (err: any) {
      console.error("❌ Error fetching top performers:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des meilleurs agents",
      );
      setTopPerformers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Fonctions CRUD ====================

  const createAgent = useCallback(
    async (agentData: AgentCreateData): Promise<Agent> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🆕 Creating agent...");

        const createdAgent = await agentService.createAgent(agentData);

        // Ajouter le nouvel agent à la liste
        setAgents((prev) => [createdAgent, ...prev]);

        // Mettre à jour la pagination
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
          pages: Math.ceil((prev.total + 1) / prev.limit),
        }));

        console.log("✅ Agent created:", createdAgent);
        return createdAgent;
      } catch (err: any) {
        console.error("❌ Error creating agent:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la création de l'agent",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateAgent = useCallback(
    async (uuid: string, agentData: AgentUpdateData): Promise<Agent> => {
      setLoading(true);
      setError(null);

      try {
        console.log("✏️ Updating agent:", uuid);

        const updatedAgent = await agentService.updateAgent(uuid, agentData);

        // Mettre à jour l'agent dans la liste
        setAgents((prev) =>
          prev.map((agent) =>
            agent.uuid === uuid ? { ...agent, ...updatedAgent } : agent,
          ),
        );

        // Mettre à jour l'agent actuel si c'est celui qui est affiché
        if (agent?.uuid === uuid) {
          setAgent(updatedAgent);
        }

        console.log("✅ Agent updated:", updatedAgent);
        return updatedAgent;
      } catch (err: any) {
        console.error("❌ Error updating agent:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la mise à jour de l'agent",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [agent],
  );

  const deleteAgent = useCallback(async (uuid: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🗑️ Deleting agent:", uuid);

      await agentService.deleteAgent(uuid);

      // Retirer l'agent de la liste
      setAgents((prev) => prev.filter((agent) => agent.uuid !== uuid));

      // Mettre à jour la pagination
      setPagination((prev) => ({
        ...prev,
        total: Math.max(prev.total - 1, 0),
        pages: Math.ceil(Math.max(prev.total - 1, 0) / prev.limit) || 1,
      }));

      console.log("✅ Agent deleted successfully");
    } catch (err: any) {
      console.error("❌ Error deleting agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la suppression de l'agent",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Fonctions de gestion de statut ====================

  const blockAgent = useCallback(async (uuid: string): Promise<Agent> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚫 Blocking agent:", uuid);

      const blockedAgent = await agentService.blockAgent(uuid);

      // Mettre à jour l'agent dans la liste
      setAgents((prev) =>
        prev.map((agent) =>
          agent.uuid === uuid
            ? { ...agent, ...blockedAgent, est_bloque: true }
            : agent,
        ),
      );

      console.log("✅ Agent blocked:", blockedAgent);
      return blockedAgent;
    } catch (err: any) {
      console.error("❌ Error blocking agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du blocage de l'agent",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unblockAgent = useCallback(async (uuid: string): Promise<Agent> => {
    setLoading(true);
    setError(null);

    try {
      console.log("✅ Unblocking agent:", uuid);

      const unblockedAgent = await agentService.unblockAgent(uuid);

      // Mettre à jour l'agent dans la liste
      setAgents((prev) =>
        prev.map((agent) =>
          agent.uuid === uuid
            ? { ...agent, ...unblockedAgent, est_bloque: false }
            : agent,
        ),
      );

      console.log("✅ Agent unblocked:", unblockedAgent);
      return unblockedAgent;
    } catch (err: any) {
      console.error("❌ Error unblocking agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du déblocage de l'agent",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreAgent = useCallback(async (uuid: string): Promise<Agent> => {
    setLoading(true);
    setError(null);

    try {
      console.log("↩️ Restoring agent:", uuid);

      const restoredAgent = await agentService.restoreAgent(uuid);

      // Mettre à jour l'agent dans la liste
      setAgents((prev) =>
        prev.map((agent) =>
          agent.uuid === uuid
            ? { ...agent, ...restoredAgent, is_deleted: false }
            : agent,
        ),
      );

      console.log("✅ Agent restored:", restoredAgent);
      return restoredAgent;
    } catch (err: any) {
      console.error("❌ Error restoring agent:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors de la restauration de l'agent",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Fonctions utilitaires ====================

  const searchAgents = useCallback(
    async (query: string, params?: PaginationParams): Promise<Agent[]> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Searching agents with query:", query);

        const searchResults = await agentService.searchAgents(query, params);
        return searchResults;
      } catch (err: any) {
        console.error("❌ Error searching agents:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la recherche d'agents",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const filterAgents = useCallback(
    async (filters: {
      departement?: string;
      poste?: string;
      statut_contrat?: string;
      est_bloque?: boolean;
      est_verifie?: boolean;
      date_embauche_start?: string;
      date_embauche_end?: string;
    }): Promise<Agent[]> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Filtering agents with filters:", filters);

        const filteredAgents = await agentService.filterAgents(filters);
        return filteredAgents;
      } catch (err: any) {
        console.error("❌ Error filtering agents:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors du filtrage des agents",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const validateAgentEmail = useCallback(
    async (email: string): Promise<{ valid: boolean; exists: boolean }> => {
      try {
        console.log("📧 Validating agent email:", email);

        const validationResult = await agentService.validateAgentEmail(email);
        return validationResult;
      } catch (err: any) {
        console.error("❌ Error validating agent email:", err);
        throw err;
      }
    },
    [],
  );

  const validateAgentMatricule = useCallback(
    async (matricule: string): Promise<{ valid: boolean; exists: boolean }> => {
      try {
        console.log("#️⃣ Validating agent matricule:", matricule);

        const validationResult =
          await agentService.validateAgentMatricule(matricule);
        return validationResult;
      } catch (err: any) {
        console.error("❌ Error validating agent matricule:", err);
        throw err;
      }
    },
    [],
  );

  const exportAgents = useCallback(
    async (format: "pdf" | "csv" = "pdf"): Promise<Blob> => {
      setLoading(true);
      setError(null);

      try {
        console.log("📄 Exporting agents in", format, "format");

        const blob = await agentService.exportAgents(format);
        return blob;
      } catch (err: any) {
        console.error("❌ Error exporting agents:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de l'export des agents",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ==================== Fonctions de pagination et rafraîchissement ====================

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    // Recharge les données avec les paramètres actuels
    fetchAgents({
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [fetchAgents, pagination.page, pagination.limit]);

  const refreshBlocked = useCallback(() => {
    fetchBlockedAgents({
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [fetchBlockedAgents, pagination.page, pagination.limit]);

  const refreshDeleted = useCallback(() => {
    fetchDeletedAgents({
      page: pagination.page,
      limit: pagination.limit,
    });
  }, [fetchDeletedAgents, pagination.page, pagination.limit]);

  // ==================== Fonctions de nettoyage ====================

  const clearAgent = useCallback(() => {
    setAgent(null);
  }, []);

  const clearStats = useCallback(() => {
    setStats(null);
  }, []);

  const clearPerformance = useCallback(() => {
    setPerformance(null);
  }, []);

  const clearTopPerformers = useCallback(() => {
    setTopPerformers([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== Fonctions de vérification ====================

  const pingService = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🏓 Pinging agent service...");

      const isOperational = await agentService.pingAgentService();
      return isOperational;
    } catch (err: any) {
      console.error("❌ Service ping failed:", err);
      return false;
    }
  }, []);

  // ==================== Fonctions de test (debug) ====================

  const testEndpoint = useCallback(async (endpoint: string): Promise<any> => {
    try {
      console.log("🧪 Testing endpoint:", endpoint);

      const result = await agentService.testEndpoint(endpoint);
      return result;
    } catch (err: any) {
      console.error("❌ Test endpoint error:", err);
      throw err;
    }
  }, []);

  // ==================== Return du hook ====================

  return {
    // Données
    agents,
    agent,
    stats,
    performance,
    topPerformers,

    // États
    loading,
    error,
    pagination,

    // Fonctions de récupération
    fetchAgents,
    fetchBlockedAgents,
    fetchDeletedAgents,
    fetchAgent,
    fetchAgentStats,
    fetchAgentPerformance,
    fetchTopPerformers,

    // Fonctions CRUD
    createAgent,
    updateAgent,
    deleteAgent,

    // Fonctions de gestion de statut
    blockAgent,
    unblockAgent,
    restoreAgent,

    // Fonctions utilitaires
    searchAgents,
    filterAgents,
    validateAgentEmail,
    validateAgentMatricule,
    exportAgents,

    // Fonctions de pagination et rafraîchissement
    setPage,
    setLimit,
    refresh,
    refreshBlocked,
    refreshDeleted,

    // Fonctions de nettoyage
    clearAgent,
    clearStats,
    clearPerformance,
    clearTopPerformers,
    clearError,

    // Fonctions de vérification
    pingService,

    // Fonctions de test (debug)
    testEndpoint,

    // Utilitaires
    hasAgents: agents.length > 0,
    isEmpty: agents.length === 0 && !loading,
    totalAgents: pagination.total,
    currentPage: pagination.page,
    totalPages: pagination.pages,
  };
};

export default useAgents;
