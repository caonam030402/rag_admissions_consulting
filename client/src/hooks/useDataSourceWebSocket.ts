import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export interface ProcessingLogMessage {
    dataSourceId: string;
    timestamp: string;
    level: "info" | "success" | "error" | "warning";
    message: string;
    step?: string;
    progress?: number;
}

export interface StatusUpdateMessage {
    dataSourceId: string;
    status: string;
    timestamp: string;
    metadata?: any;
}

export interface ProcessingCompleteMessage {
    dataSourceId: string;
    result: {
        documents?: number;
        vectors?: number;
        status: string;
    };
    timestamp: string;
}

export interface ProcessingErrorMessage {
    dataSourceId: string;
    error: string;
    timestamp: string;
}

export function useDataSourceWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [processingLogs, setProcessingLogs] = useState<ProcessingLogMessage[]>(() => {
        // Load logs from localStorage on init
        if (typeof window !== 'undefined') {
            const savedLogs = localStorage.getItem('processingLogs');
            return savedLogs ? JSON.parse(savedLogs) : [];
        }
        return [];
    });
    const [statusUpdates, setStatusUpdates] = useState<StatusUpdateMessage[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Save logs to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('processingLogs', JSON.stringify(processingLogs));
        }
    }, [processingLogs]);

    useEffect(() => {
        // Initialize WebSocket connection with correct URL
        const backendUrl = "http://localhost:5000"; // Direct URL since we know backend port

        const socket = io(`${backendUrl}/data-sources`, {
            transports: ["websocket", "polling"], // Add polling as fallback
            autoConnect: true,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        console.log(`🔌 Connecting to WebSocket: ${backendUrl}/data-sources`);
        socketRef.current = socket;

        // Connection events
        socket.on("connect", () => {
            console.log("✅ Connected to data source WebSocket");
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("❌ Disconnected from data source WebSocket");
            setIsConnected(false);
        });

        socket.on("connect_error", (error) => {
            console.log("🚫 WebSocket connection error:", error);
        });

        socket.on("connected", (data: any) => {
            console.log("📡 WebSocket connection confirmed:", data);
        });

        // Processing events
        socket.on("processing-log", (log: ProcessingLogMessage) => {
            console.log("📝 Processing log:", log);
            setProcessingLogs((prev) => [...prev, log]);
        });

        socket.on("status-update", (update: StatusUpdateMessage) => {
            console.log("🔄 Status update:", update);
            setStatusUpdates((prev) => [...prev, update]);
        });

        socket.on("processing-complete", (completion: ProcessingCompleteMessage) => {
            console.log("✅ Processing complete:", completion);
            setProcessingLogs((prev) => [
                ...prev,
                {
                    dataSourceId: completion.dataSourceId,
                    timestamp: completion.timestamp,
                    level: "success",
                    message: `🎉 Processing completed! ${completion.result.documents || 0} docs, ${completion.result.vectors || 0} vectors`,
                    step: "complete",
                    progress: 100,
                },
            ]);
        });

        socket.on("processing-error", (error: ProcessingErrorMessage) => {
            console.log("❌ Processing error:", error);
            setProcessingLogs((prev) => [
                ...prev,
                {
                    dataSourceId: error.dataSourceId,
                    timestamp: error.timestamp,
                    level: "error",
                    message: `💥 Error: ${error.error}`,
                    step: "error",
                    progress: 100,
                },
            ]);
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

    // Clear logs for specific data source
    const clearLogsForDataSource = (dataSourceId: string) => {
        setProcessingLogs((prev) =>
            prev.filter((log) => log.dataSourceId !== dataSourceId)
        );
        setStatusUpdates((prev) =>
            prev.filter((update) => update.dataSourceId !== dataSourceId)
        );
    };

    // Clear all logs
    const clearAllLogs = () => {
        setProcessingLogs([]);
        setStatusUpdates([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('processingLogs');
        }
    };

    // Get logs for specific data source
    const getLogsForDataSource = (dataSourceId: string) => {
        return processingLogs.filter((log) => log.dataSourceId === dataSourceId);
    };

    // Get latest status for data source
    const getLatestStatus = (dataSourceId: string) => {
        const updates = statusUpdates.filter(
            (update) => update.dataSourceId === dataSourceId
        );
        return updates[updates.length - 1] || null;
    };

    return {
        isConnected,
        processingLogs,
        statusUpdates,
        clearLogsForDataSource,
        clearAllLogs,
        getLogsForDataSource,
        getLatestStatus,
        socket: socketRef.current,
    };
} 