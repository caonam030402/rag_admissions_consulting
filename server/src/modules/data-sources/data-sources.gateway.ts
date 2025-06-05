import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface ProcessingLogMessage {
  dataSourceId: string;
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  step?: string;
  progress?: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/data-sources',
})
export class DataSourcesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send connection confirmation
    client.emit('connected', {
      message: 'Connected to data sources real-time updates',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  // Emit processing log to all connected clients
  emitProcessingLog(log: ProcessingLogMessage) {
    this.server.emit('processing-log', log);
  }

  // Emit status update to all connected clients
  emitStatusUpdate(dataSourceId: string, status: string, metadata?: any) {
    this.server.emit('status-update', {
      dataSourceId,
      status,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  // Emit processing completion
  emitProcessingComplete(dataSourceId: string, result: any) {
    this.server.emit('processing-complete', {
      dataSourceId,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  // Emit processing error
  emitProcessingError(dataSourceId: string, error: string) {
    this.server.emit('processing-error', {
      dataSourceId,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  // Join specific data source room for targeted updates
  joinDataSourceRoom(clientId: string, dataSourceId: string) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.join(`datasource-${dataSourceId}`);
    }
  }

  // Leave data source room
  leaveDataSourceRoom(clientId: string, dataSourceId: string) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.leave(`datasource-${dataSourceId}`);
    }
  }

  // Emit to specific data source room
  emitToDataSourceRoom(dataSourceId: string, event: string, data: any) {
    this.server.to(`datasource-${dataSourceId}`).emit(event, data);
  }
}
