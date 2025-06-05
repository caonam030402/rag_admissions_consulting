export enum HandoffStatus {
    NONE = "none",
    REQUESTING = "requesting",
    WAITING = "waiting",
    CONNECTED = "connected",
    DECLINED = "declined",
    TIMEOUT = "timeout",
}

export interface IHandoffRequest {
    id: string;
    conversationId: string;
    userId?: number;
    guestId?: string;
    userMessage: string;
    timestamp: number;
    status: HandoffStatus;
    adminId?: number;
    adminName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateHandoffRequest {
    conversationId: string;
    userMessage: string;
    userId?: number;
    guestId?: string;
}

export interface IAcceptHandoffRequest {
    requestId: string;
    adminId: number;
    adminName: string;
}

export interface IDeclineHandoffRequest {
    requestId: string;
    adminId: number;
}

export interface IHumanMessage {
    id: string;
    conversationId: string;
    content: string;
    isFromAdmin: boolean;
    adminId?: number;
    adminName?: string;
    timestamp: number;
}

export interface IHandoffState {
    // User state
    handoffStatus: HandoffStatus;
    currentRequest: IHandoffRequest | null;
    isHumanMode: boolean;
    timeoutId: NodeJS.Timeout | null;

    // Admin state  
    pendingRequests: IHandoffRequest[];
    activeHandoffs: IHandoffRequest[];

    // WebSocket connection
    isConnected: boolean;
} 