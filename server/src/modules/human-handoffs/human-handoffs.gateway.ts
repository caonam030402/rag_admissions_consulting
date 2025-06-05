import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface AdminNotificationData {
    sessionId: string;
    conversationId: string;
    userProfile?: {
        name?: string;
        email?: string;
    };
    initialMessage: string;
    requestedAt: Date;
}

interface HumanSupportAcceptedData {
    sessionId: string;
    conversationId: string;
    adminId: number;
    adminName: string;
}

interface HumanSupportEndedData {
    sessionId: string;
    conversationId: string;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_DOMAIN || 'http://localhost:3001',
        credentials: true,
    },
    namespace: '/human-handoff',
})
export class HumanHandoffsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(HumanHandoffsGateway.name);
    private adminSockets = new Map<number, Socket[]>(); // adminId -> sockets
    private userSockets = new Map<string, Socket>(); // conversationId -> socket

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        // Extract user info from query or auth
        const conversationId = client.handshake.query.conversationId as string;
        const adminId = client.handshake.query.adminId as string;

        if (conversationId) {
            // User/Guest connection
            this.userSockets.set(conversationId, client);
            this.logger.log(`User connected for conversation: ${conversationId}`);
        }

        if (adminId) {
            // Admin connection
            const id = parseInt(adminId, 10);
            if (!this.adminSockets.has(id)) {
                this.adminSockets.set(id, []);
            }
            this.adminSockets.get(id)!.push(client);
            this.logger.log(`Admin connected: ${adminId}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Remove from user sockets
        for (const [conversationId, socket] of this.userSockets.entries()) {
            if (socket.id === client.id) {
                this.userSockets.delete(conversationId);
                this.logger.log(`User disconnected from conversation: ${conversationId}`);
                break;
            }
        }

        // Remove from admin sockets
        for (const [adminId, sockets] of this.adminSockets.entries()) {
            const index = sockets.findIndex(socket => socket.id === client.id);
            if (index !== -1) {
                sockets.splice(index, 1);
                if (sockets.length === 0) {
                    this.adminSockets.delete(adminId);
                }
                this.logger.log(`Admin disconnected: ${adminId}`);
                break;
            }
        }
    }

    // Notify all admins about new human support request
    notifyAdmins(data: AdminNotificationData) {
        this.logger.log(`Notifying admins about new request: ${data.sessionId}`);

        // Broadcast to all connected admins
        for (const [adminId, sockets] of this.adminSockets.entries()) {
            sockets.forEach(socket => {
                socket.emit('admin-notification', data);
            });
        }

        // Also broadcast to general admin room (for admin dashboard)
        this.server.to('admin-room').emit('admin-notification', data);
    }

    // Notify user that admin accepted their request
    notifyUserAccepted(data: HumanSupportAcceptedData) {
        this.logger.log(`Notifying user about accepted request: ${data.sessionId}`);

        const userSocket = this.userSockets.get(data.conversationId);
        if (userSocket) {
            userSocket.emit('human-support-accepted', {
                sessionId: data.sessionId,
                adminName: data.adminName,
            });
        }
    }

    // Notify user that session ended
    notifyUserEnded(data: HumanSupportEndedData) {
        this.logger.log(`Notifying user about ended session: ${data.sessionId}`);

        const userSocket = this.userSockets.get(data.conversationId);
        if (userSocket) {
            userSocket.emit('human-support-ended', {
                sessionId: data.sessionId,
            });
        }
    }

    // Notify user about timeout
    notifyUserTimeout(data: HumanSupportEndedData) {
        this.logger.log(`Notifying user about timeout: ${data.sessionId}`);

        const userSocket = this.userSockets.get(data.conversationId);
        if (userSocket) {
            userSocket.emit('human-support-timeout', {
                sessionId: data.sessionId,
            });
        }
    }

    // Send message during human support session
    sendMessageToUser(conversationId: string, message: string, adminName: string) {
        const userSocket = this.userSockets.get(conversationId);
        if (userSocket) {
            userSocket.emit('human-message', {
                message,
                adminName,
                timestamp: new Date(),
            });
        }
    }

    // Send message from user to admin
    sendMessageToAdmin(conversationId: string, adminId: number, message: string) {
        const adminSockets = this.adminSockets.get(adminId);
        if (adminSockets) {
            adminSockets.forEach(socket => {
                socket.emit('user-message', {
                    conversationId,
                    message,
                    timestamp: new Date(),
                });
            });
        }
    }

    // Get connected users count
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    // Get connected admins count
    getConnectedAdminsCount(): number {
        return this.adminSockets.size;
    }

    // Check if admin is online
    isAdminOnline(adminId: number): boolean {
        return this.adminSockets.has(adminId) && this.adminSockets.get(adminId)!.length > 0;
    }

    // Check if user is online
    isUserOnline(conversationId: string): boolean {
        return this.userSockets.has(conversationId);
    }
}
