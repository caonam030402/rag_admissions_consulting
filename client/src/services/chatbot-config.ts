import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useQueryCommon } from "@/hooks/useQuery";
import type {
    ChatbotConfig,
    UpdateAppearanceData,
    UpdateBasicInfoData,
    UpdateHumanHandoffData,
    UpdateWelcomeSettingsData,
} from "@/types/chatbot-config.types";
import http from "@/utils/http";

export const chatbotConfigService = {
    // Get active merged config for RAG system
    useGetActiveConfig: () => {
        return useQueryCommon<ChatbotConfig>({
            url: "chatbot-config/active",
            queryKey: ["chatbot-config", "active"],
        });
    },

    // Get all configs (admin only)
    useGetAllConfigs: (params?: any) => {
        return useQueryCommon<ChatbotConfig[]>({
            url: `chatbot-config${params ? `?${new URLSearchParams(params)}` : ""}`,
            queryKey: ["chatbot-config", "all", params],
        });
    },

    // Get config by ID (admin only)
    useGetConfigById: (id: string) => {
        return useQueryCommon<ChatbotConfig>({
            url: `chatbot-config/${id}`,
            queryKey: ["chatbot-config", id],
            enabled: !!id,
        });
    },

    // Public APIs for frontend
    useGetBasicInfo: () => {
        return useQueryCommon<{
            personality: ChatbotConfig["personality"];
            llmConfig: Partial<ChatbotConfig["llmConfig"]>;
        }>({
            url: "chatbot-config/public/basic-info",
            queryKey: ["chatbot-config", "public", "basic-info"],
        });
    },

    useGetAppearance: () => {
        return useQueryCommon<{
            appearance: ChatbotConfig["appearance"];
        }>({
            url: "chatbot-config/public/appearance",
            queryKey: ["chatbot-config", "public", "appearance"],
        });
    },

    useGetWelcomeSettings: () => {
        return useQueryCommon<{
            welcomeSettings: ChatbotConfig["welcomeSettings"];
        }>({
            url: "chatbot-config/public/welcome-settings",
            queryKey: ["chatbot-config", "public", "welcome-settings"],
        });
    },

    useGetHumanHandoff: () => {
        return useQueryCommon<{
            humanHandoff: ChatbotConfig["humanHandoff"];
        }>({
            url: "chatbot-config/public/human-handoff",
            queryKey: ["chatbot-config", "public", "human-handoff"],
        });
    },

    // Create new config (admin only)
    useCreateConfig: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (data: Partial<ChatbotConfig>) => {
                const response = await http.post<ChatbotConfig>("chatbot-config", {
                    body: data,
                });
                return response.payload;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Configuration created successfully");
            },
            onError: (error) => {
                toast.error("Failed to create configuration");
            },
        });
    },

    // Update basic info section
    useUpdateBasicInfo: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (data: UpdateBasicInfoData) => {
                const response = await http.patch<ChatbotConfig>(
                    "chatbot-config/section/basic-info",
                    { body: data },
                );
                return response.payload;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Basic info updated successfully");
            },
            onError: (error) => {
                toast.error("Failed to update basic info");
            },
        });
    },

    // Update appearance section
    useUpdateAppearance: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (data: UpdateAppearanceData) => {
                const response = await http.patch<ChatbotConfig>(
                    "chatbot-config/section/appearance",
                    { body: data },
                );
                return response.payload;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Appearance updated successfully");
            },
            onError: (error) => {
                toast.error("Failed to update appearance");
            },
        });
    },

    // Update welcome settings section
    useUpdateWelcomeSettings: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (data: UpdateWelcomeSettingsData) => {
                const response = await http.patch<ChatbotConfig>(
                    "chatbot-config/section/welcome-settings",
                    { body: data },
                );
                return response.payload;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Welcome settings updated successfully");
            },
            onError: (error) => {
                toast.error("Failed to update welcome settings");
            },
        });
    },

    // Update human handoff section
    useUpdateHumanHandoff: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (data: UpdateHumanHandoffData) => {
                const response = await http.patch<ChatbotConfig>(
                    "chatbot-config/section/human-handoff",
                    { body: data },
                );
                return response.payload;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Human handoff settings updated successfully");
            },
            onError: (error) => {
                toast.error("Failed to update human handoff settings");
            },
        });
    },

    // Delete config (admin only)
    useDeleteConfig: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async (id: string) => {
                await http.delete(`chatbot-config/${id}`, { body: {} });
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Configuration deleted successfully");
            },
            onError: (error) => {
                toast.error("Failed to delete configuration");
            },
        });
    },

    // Initialize default config (admin only)
    useInitializeDefault: () => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: async () => {
                const response = await http.get<ChatbotConfig>(
                    "chatbot-config/initialize",
                );
                return response.payload;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["chatbot-config"] });
                toast.success("Default configuration initialized");
            },
            onError: (error) => {
                toast.error("Failed to initialize default configuration");
            },
        });
    },

    // Server-side functions (không cần React hooks)
    getActiveConfig: () => {
        return http.get<ChatbotConfig>("chatbot-config/active");
    },

    getBasicInfo: () => {
        return http.get("chatbot-config/public/basic-info");
    },

    getAppearance: () => {
        return http.get("chatbot-config/public/appearance");
    },
};
