import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { In } from 'typeorm';

import { CreateHumanHandoffDto } from './dto/create-human-handoff.dto';
import { UpdateHumanHandoffDto } from './dto/update-human-handoff.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { HumanHandoff } from './domain/human-handoff';
import { HumanHandoffEntity } from './infrastructure/persistence/relational/entities/human-handoff.entity';
import { HumanHandoffMapper } from './infrastructure/persistence/relational/mappers/human-handoff.mapper';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { HumanHandoffsGateway } from './human-handoffs.gateway';
import { chatbotsService } from '../chatbots/chatbots.service';
import { ChatbotRole } from '../../common/enums/chatbot.enum';

@Injectable()
export class HumanHandoffsService {
  constructor(
    @InjectRepository(HumanHandoffEntity)
    private readonly humanHandoffRepository: Repository<HumanHandoffEntity>,
    private readonly gateway: HumanHandoffsGateway,
    private readonly chatbotsService: chatbotsService,
  ) {}

  async create(createDto: CreateHumanHandoffDto): Promise<HumanHandoff> {
    // Check for existing active handoff for this user (not just conversation)
    const existingHandoff = await this.humanHandoffRepository.findOne({
      where: [
        // If user is authenticated, check by userId
        ...(createDto.userId
          ? [
              {
                userId: createDto.userId,
                status: In(['waiting', 'connected']),
              },
            ]
          : []),
        // If guest user, check by guestId
        ...(createDto.guestId
          ? [
              {
                guestId: createDto.guestId,
                status: In(['waiting', 'connected']),
              },
            ]
          : []),
      ],
    });

    if (existingHandoff) {
      throw new BadRequestException(
        'Bạn đã có phiên tư vấn đang hoạt động. Vui lòng hoàn thành phiên hiện tại trước khi tạo phiên mới.',
      );
    }

    // Create new handoff session
    const handoff = this.humanHandoffRepository.create({
      conversationId: createDto.conversationId,
      userId: createDto.userId,
      guestId: createDto.guestId,
      initialMessage: createDto.message,
      userProfile: createDto.userProfile,
      status: 'waiting',
      requestedAt: new Date(),
    });

    const savedHandoff = await this.humanHandoffRepository.save(handoff);

    // Emit to admins
    this.gateway.notifyAdmins({
      sessionId: savedHandoff.id,
      conversationId: savedHandoff.conversationId,
      userProfile: savedHandoff.userProfile,
      initialMessage: savedHandoff.initialMessage,
      requestedAt: savedHandoff.requestedAt,
    });

    return HumanHandoffMapper.toDomain(savedHandoff);
  }

  async getStatus(conversationId: string): Promise<{
    isWaiting: boolean;
    isConnected: boolean;
    adminName?: string;
    timeoutRemaining?: number;
  }> {
    const session = await this.humanHandoffRepository.findOne({
      where: [
        { conversationId, status: 'waiting' as any },
        { conversationId, status: 'connected' as any },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!session) {
      return {
        isWaiting: false,
        isConnected: false,
      };
    }

    const isWaiting = session.status === 'waiting';
    const isConnected = session.status === 'connected';

    // Calculate timeout remaining for waiting sessions
    let timeoutRemaining: number | undefined;
    if (isWaiting && session.requestedAt) {
      const elapsed = Date.now() - session.requestedAt.getTime();
      const timeout = 60000; // 60 seconds
      timeoutRemaining = Math.max(0, timeout - elapsed);

      // Auto-timeout if exceeded
      if (timeoutRemaining <= 0) {
        await this.humanHandoffRepository.update(session.id, {
          status: 'timeout' as any,
          endedAt: new Date(),
        });
        return {
          isWaiting: false,
          isConnected: false,
        };
      }
    }

    return {
      isWaiting,
      isConnected,
      adminName: session.adminId ? `Admin ${session.adminId}` : undefined,
      timeoutRemaining,
    };
  }

  async getAdminNotifications(): Promise<HumanHandoff[]> {
    const sessions = await this.humanHandoffRepository.find({
      where: { status: 'waiting' as any },
      order: { createdAt: 'ASC' },
    });

    return sessions.map((session) => HumanHandoffMapper.toDomain(session));
  }

  async acceptHandoff(
    sessionId: string,
    adminId: number,
  ): Promise<HumanHandoff> {
    const session = await this.humanHandoffRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Handoff session not found');
    }

    if (session.status !== 'waiting') {
      throw new BadRequestException('Session is not in waiting status');
    }

    await this.humanHandoffRepository.update(sessionId, {
      status: 'connected' as any,
      adminId,
      connectedAt: new Date(),
    });

    const updatedSession = await this.humanHandoffRepository.findOne({
      where: { id: sessionId },
    });

    // Notify user that admin accepted their request
    this.gateway.notifyUserAccepted({
      sessionId,
      conversationId: session.conversationId,
      adminId,
      adminName: `Admin ${adminId}`,
    });

    return HumanHandoffMapper.toDomain(updatedSession!);
  }

  async endHandoff(sessionId: string): Promise<HumanHandoff> {
    const session = await this.humanHandoffRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Handoff session not found');
    }

    await this.humanHandoffRepository.update(sessionId, {
      status: 'ended' as any,
      endedAt: new Date(),
    });

    const updatedSession = await this.humanHandoffRepository.findOne({
      where: { id: sessionId },
    });

    // 🔥 FIX: Notify user that session ended
    this.gateway.notifyUserEnded({
      sessionId,
      conversationId: session.conversationId,
    });

    return HumanHandoffMapper.toDomain(updatedSession!);
  }

  async getAdminSessions(): Promise<HumanHandoff[]> {
    const sessions = await this.humanHandoffRepository.find({
      order: { createdAt: 'DESC' },
      take: 50, // Limit to recent 50 sessions
    });

    return sessions.map((session) => HumanHandoffMapper.toDomain(session));
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    const [entities, count] = await this.humanHandoffRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entities.map((entity) => HumanHandoffMapper.toDomain(entity)),
      count,
      hasNextPage: count > paginationOptions.page * paginationOptions.limit,
    };
  }

  async findOne(id: HumanHandoff['id']) {
    const entity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Human handoff session not found');
    }

    return HumanHandoffMapper.toDomain(entity);
  }

  async update(
    id: HumanHandoff['id'],
    updateHumanHandoffDto: UpdateHumanHandoffDto,
  ) {
    const entity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Human handoff session not found');
    }

    await this.humanHandoffRepository.update(id, updateHumanHandoffDto);

    const updatedEntity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    return HumanHandoffMapper.toDomain(updatedEntity!);
  }

  async remove(id: HumanHandoff['id']) {
    const entity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('Human handoff session not found');
    }

    await this.humanHandoffRepository.remove(entity);
    return HumanHandoffMapper.toDomain(entity);
  }

  async sendUserMessage(
    conversationId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<{ success: boolean; message: string }> {
    // Find active handoff session for conversation
    const session = await this.humanHandoffRepository.findOne({
      where: {
        conversationId,
        status: 'connected',
      },
    });

    if (!session) {
      throw new BadRequestException(
        'No active handoff session found for this conversation',
      );
    }

    // Save user message to chat history
    try {
      await this.chatbotsService.createHistory({
        userId: session.userId,
        guestId: session.guestId,
        role: ChatbotRole.USER,
        content: sendMessageDto.message,
        conversationId: conversationId,
        title: 'Human Handoff Chat',
      });
    } catch (error) {
      console.error('Failed to save user message to history:', error);
    }

    // Send message to admin via socket
    if (session.adminId) {
      this.gateway.sendMessageToAdmin(
        conversationId,
        session.adminId,
        sendMessageDto.message,
      );
    }

    return {
      success: true,
      message: 'Message sent to admin',
    };
  }

  async sendMessage(
    sessionId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<{ success: boolean; message: string }> {
    const session = await this.humanHandoffRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Handoff session not found');
    }

    if (session.status !== 'connected') {
      throw new BadRequestException('Session is not in connected state');
    }

    // Save message to chat history
    try {
      const role =
        sendMessageDto.senderType === 'admin'
          ? ChatbotRole.ASSISTANT
          : ChatbotRole.USER;
      await this.chatbotsService.createHistory({
        userId: session.userId,
        guestId: session.guestId,
        role: role,
        content: sendMessageDto.message,
        conversationId: session.conversationId,
        title: 'Human Handoff Chat',
      });
    } catch (error) {
      console.error('Failed to save message to history:', error);
    }

    if (sendMessageDto.senderType === 'admin') {
      // Admin sending message to user
      this.gateway.sendMessageToUser(
        session.conversationId,
        sendMessageDto.message,
        sendMessageDto.adminName || 'Admin',
      );
    } else {
      // User sending message to admin
      if (session.adminId) {
        this.gateway.sendMessageToAdmin(
          session.conversationId,
          session.adminId,
          sendMessageDto.message,
        );
      }
    }

    return {
      success: true,
      message: 'Message sent successfully',
    };
  }

  async end(id: string): Promise<HumanHandoff> {
    const humanHandoffEntity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    if (!humanHandoffEntity) {
      throw new NotFoundException('Human handoff session not found');
    }

    // Update the handoff session
    await this.humanHandoffRepository.update(id, {
      status: 'ended' as any,
      endedAt: new Date(),
    });

    const updatedEntity = await this.humanHandoffRepository.findOne({
      where: { id },
    });

    // Notify user that session ended
    this.gateway.notifyUserEnded({
      sessionId: id,
      conversationId: humanHandoffEntity.conversationId,
    });

    return HumanHandoffMapper.toDomain(updatedEntity!);
  }
}
