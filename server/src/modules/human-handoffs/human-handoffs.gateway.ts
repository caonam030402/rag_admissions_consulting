import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
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

// TODO: Use this interface for message saving later
// interface MessageData {
//   conversationId: string;
//   message: string;
//   senderType: 'user' | 'admin';
//   adminName?: string;
//   timestamp: Date;
// }

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/human-handoff',
})
export class HumanHandoffsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(HumanHandoffsGateway.name);
  private adminSockets = new Map<number, Socket[]>(); // adminId -> sockets
  private userSockets = new Map<string, Socket>(); // conversationId -> socket
  private conversationToAdmin = new Map<string, string>(); // conversationId -> adminSocketId
  private conversationToUser = new Map<string, string>(); // conversationId -> userSocketId

  constructor() {}

  handleConnection(client: Socket) {
    this.logger.log(`🟢 Client connected: ${client.id}`);

    // Extract user info from query or auth
    const conversationId = client.handshake.query.conversationId as string;
    const adminId = client.handshake.query.adminId as string;

    this.logger.log(
      `Connection details - conversationId: ${conversationId}, adminId: ${adminId}`,
    );

    if (conversationId) {
      // User/Guest connection
      this.userSockets.set(conversationId, client);
      this.logger.log(`👤 User connected for conversation: ${conversationId}`);

      // Emit connection confirmation
      client.emit('connection-confirmed', {
        type: 'user',
        conversationId,
        timestamp: new Date(),
      });
    }

    if (adminId) {
      // Admin connection
      const id = parseInt(adminId, 10);
      if (!this.adminSockets.has(id)) {
        this.adminSockets.set(id, []);
      }
      this.adminSockets.get(id)!.push(client);
      this.logger.log(`👨‍💼 Admin connected: ${adminId}`);

      // Emit connection confirmation
      client.emit('connection-confirmed', {
        type: 'admin',
        adminId: id,
        timestamp: new Date(),
      });
    }

    // Log current connection stats
    this.logger.log(
      `📊 Connection stats - Users: ${this.userSockets.size}, Admins: ${this.adminSockets.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from user sockets
    for (const [conversationId, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(conversationId);
        this.logger.log(
          `User disconnected from conversation: ${conversationId}`,
        );
        break;
      }
    }

    // Remove from admin sockets
    for (const [adminId, sockets] of this.adminSockets.entries()) {
      const index = sockets.findIndex((socket) => socket.id === client.id);
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

  // Socket event listeners for real-time messaging
  @SubscribeMessage('send-user-message')
  handleUserMessage(
    @MessageBody()
    data: {
      conversationId: string;
      message: string;
      guestId?: string;
      userId?: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('📨 Gateway received user message:', data);

      // TODO: Add conversation validation later
      // TODO: Add message saving to database later

      console.log('✅ Processing user message');

      // Find admin handling this conversation
      const adminSocketId = this.conversationToAdmin.get(data.conversationId);

      if (adminSocketId) {
        console.log(
          `📤 Forwarding user message to admin socket: ${adminSocketId}`,
        );

        // Send to specific admin
        this.server.to(adminSocketId).emit('user-message', {
          conversationId: data.conversationId,
          message: data.message,
          timestamp: new Date(),
          senderInfo: {
            guestId: data.guestId,
            userId: data.userId,
          },
        });

        // Confirm delivery to user
        client.emit('message-delivered', {
          conversationId: data.conversationId,
          messageId: Date.now(),
        });
      } else {
        console.log('⚠️ No admin found for conversation:', data.conversationId);
        client.emit('admin-not-available', {
          conversationId: data.conversationId,
        });
      }
    } catch (error) {
      console.error('❌ Error handling user message:', error);
      client.emit('message-error', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('send-admin-message')
  handleAdminMessage(
    @MessageBody()
    data: { conversationId: string; message: string; adminId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('📨 Gateway received admin message:', data);

      // TODO: Add message saving to database later
      console.log('✅ Processing admin message');

      // Find user socket for this conversation
      const userSocketId = this.conversationToUser.get(data.conversationId);

      if (userSocketId) {
        console.log(
          `📤 Forwarding admin message to user socket: ${userSocketId}`,
        );

        // Send to specific user
        this.server.to(userSocketId).emit('admin-message', {
          conversationId: data.conversationId,
          message: data.message,
          timestamp: new Date(),
          adminId: data.adminId,
        });

        // Confirm delivery to admin
        client.emit('message-delivered', {
          conversationId: data.conversationId,
          messageId: Date.now(),
        });
      } else {
        console.log('⚠️ No user found for conversation:', data.conversationId);
        client.emit('user-disconnected', {
          conversationId: data.conversationId,
        });
      }
    } catch (error) {
      console.error('❌ Error handling admin message:', error);
      client.emit('message-error', { error: 'Failed to send message' });
    }
  }

  // Notify all admins about new human support request
  notifyAdmins(data: AdminNotificationData) {
    this.logger.log(`Notifying admins about new request: ${data.sessionId}`);

    // Broadcast to all connected admins
    for (const [adminId, sockets] of this.adminSockets.entries()) {
      sockets.forEach((socket) => {
        socket.emit('admin-notification', data);
      });
    }

    // Also broadcast to general admin room (for admin dashboard)
    this.server.to('admin-room').emit('admin-notification', data);
  }

  // Notify user that admin accepted their request
  notifyUserAccepted(data: HumanSupportAcceptedData) {
    this.logger.log(`Notifying user about accepted request: ${data.sessionId}`);

    // 🔥 CRITICAL: Map conversation to admin for message routing
    const adminSockets = this.adminSockets.get(data.adminId);
    if (adminSockets && adminSockets.length > 0) {
      const adminSocket = adminSockets[0];
      this.conversationToAdmin.set(data.conversationId, adminSocket.id);
      this.logger.log(
        `Mapped conversation ${data.conversationId} → admin ${adminSocket.id}`,
      );
    }

    // Map user socket for message routing
    const userSocket = this.userSockets.get(data.conversationId);
    if (userSocket) {
      this.conversationToUser.set(data.conversationId, userSocket.id);
      this.logger.log(
        `Mapped conversation ${data.conversationId} → user ${userSocket.id}`,
      );

      userSocket.emit('human-support-accepted', {
        sessionId: data.sessionId,
        adminName: data.adminName,
        adminId: data.adminId,
      });
    } else {
      this.logger.error(
        `No user socket found for conversation: ${data.conversationId}`,
      );
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
      this.logger.log(`Sent 'human-support-ended' to user ${userSocket.id}`);
    } else {
      this.logger.error(
        `No user socket found for conversation: ${data.conversationId}`,
      );
    }

    // 🔥 Clean up conversation mappings when session ends
    this.conversationToAdmin.delete(data.conversationId);
    this.conversationToUser.delete(data.conversationId);
    this.logger.log(
      `Cleaned up mappings for conversation: ${data.conversationId}`,
    );
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
  sendMessageToUser(
    conversationId: string,
    message: string,
    adminName: string,
  ) {
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
      adminSockets.forEach((socket) => {
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
    return (
      this.adminSockets.has(adminId) &&
      this.adminSockets.get(adminId)!.length > 0
    );
  }

  // Check if user is online
  isUserOnline(conversationId: string): boolean {
    return this.userSockets.has(conversationId);
  }
}
