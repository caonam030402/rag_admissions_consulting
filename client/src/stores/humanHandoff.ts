import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
    IHandoffRequest,
    IHandoffState,
    HandoffStatus
} from "@/types/humanHandoff";

interface IHumanHandoffActions {
    // User actions
    requestHumanHandoff: (conversationId: string, userMessage: string) => void;
    setHandoffStatus: (status: HandoffStatus) => void;
    setCurrentRequest: (request: IHandoffRequest | null) => void;
    setHumanMode: (isHuman: boolean) => void;
    setTimeoutId: (timeoutId: NodeJS.Timeout | null) => void;

    // Admin actions
    addPendingRequest: (request: IHandoffRequest) => void;
    removePendingRequest: (requestId: string) => void;
    addActiveHandoff: (request: IHandoffRequest) => void;
    removeActiveHandoff: (requestId: string) => void;

    // WebSocket actions
    setConnected: (isConnected: boolean) => void;

    // Utility actions
    resetHandoff: () => void;
    clearTimeout: () => void;
}

type IHumanHandoffStore = IHandoffState & IHumanHandoffActions;

export const useHumanHandoffStore = create<IHumanHandoffStore>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                handoffStatus: HandoffStatus.NONE,
                currentRequest: null,
                isHumanMode: false,
                timeoutId: null,
                pendingRequests: [],
                activeHandoffs: [],
                isConnected: false,

                // User actions
                requestHumanHandoff: (conversationId: string, userMessage: string) => {
                    const state = get();

                    // Clear existing timeout
                    if (state.timeoutId) {
                        clearTimeout(state.timeoutId);
                    }

                    // Create timeout for 60 seconds
                    const timeoutId = setTimeout(() => {
                        set({
                            handoffStatus: HandoffStatus.TIMEOUT,
                            isHumanMode: false,
                            timeoutId: null,
                        });

                        // Auto reset after showing timeout message
                        setTimeout(() => {
                            get().resetHandoff();
                        }, 3000);
                    }, 60000);

                    set({
                        handoffStatus: HandoffStatus.REQUESTING,
                        timeoutId,
                    });
                },

                setHandoffStatus: (status: HandoffStatus) => {
                    set({ handoffStatus: status });
                },

                setCurrentRequest: (request: IHandoffRequest | null) => {
                    set({ currentRequest: request });
                },

                setHumanMode: (isHuman: boolean) => {
                    set({ isHumanMode: isHuman });
                },

                setTimeoutId: (timeoutId: NodeJS.Timeout | null) => {
                    set({ timeoutId });
                },

                // Admin actions
                addPendingRequest: (request: IHandoffRequest) => {
                    set((state) => ({
                        pendingRequests: [...state.pendingRequests, request],
                    }));
                },

                removePendingRequest: (requestId: string) => {
                    set((state) => ({
                        pendingRequests: state.pendingRequests.filter(r => r.id !== requestId),
                    }));
                },

                addActiveHandoff: (request: IHandoffRequest) => {
                    set((state) => ({
                        activeHandoffs: [...state.activeHandoffs, request],
                    }));
                },

                removeActiveHandoff: (requestId: string) => {
                    set((state) => ({
                        activeHandoffs: state.activeHandoffs.filter(r => r.id !== requestId),
                    }));
                },

                // WebSocket actions
                setConnected: (isConnected: boolean) => {
                    set({ isConnected });
                },

                // Utility actions
                clearTimeout: () => {
                    const state = get();
                    if (state.timeoutId) {
                        clearTimeout(state.timeoutId);
                        set({ timeoutId: null });
                    }
                },

                resetHandoff: () => {
                    const state = get();
                    if (state.timeoutId) {
                        clearTimeout(state.timeoutId);
                    }
                    set({
                        handoffStatus: HandoffStatus.NONE,
                        currentRequest: null,
                        isHumanMode: false,
                        timeoutId: null,
                    });
                },
            }),
            {
                name: "human-handoff-store",
                partialize: (state) => ({
                    // Only persist essential state
                    handoffStatus: state.handoffStatus,
                    isHumanMode: state.isHumanMode,
                    currentRequest: state.currentRequest,
                }),
            }
        ),
        { name: "HumanHandoffStore" }
    )
); 