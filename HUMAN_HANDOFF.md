# Human Handoff System Documentation

## Tổng quan

Human Handoff System cho phép chuyển giao cuộc trò chuyện từ chatbot sang cán bộ tư vấn thật khi người dùng yêu cầu. Hệ thống hoạt động real-time với timeout 60 giây.

## Kiến trúc

### Frontend Components

#### 1. `useHumanHandoff` Hook
- **Location**: `client/src/hooks/useHumanHandoff.ts`
- **Chức năng**: Quản lý state và logic human handoff
- **Features**:
  - Request human support
  - Real-time status updates via Socket.IO
  - 60-second timeout management
  - Auto cleanup

#### 2. `HumanHandoffIndicator` Component
- **Location**: `client/src/components/business/ChatbotWidget/HumanHandoffIndicator.tsx`
- **Chức năng**: Hiển thị trạng thái human handoff
- **States**:
  - Waiting: Hiển thị countdown timer
  - Connected: Hiển thị thông tin admin đang hỗ trợ
  - Hidden: Khi không có session nào

#### 3. `HumanHandoffManager` Component
- **Location**: `client/src/components/admin/HumanHandoffManager.tsx`
- **Chức năng**: Admin interface để manage handoff requests
- **Features**:
  - View pending requests
  - Accept handoff sessions
  - End active sessions
  - Real-time notifications

### Backend Architecture

#### 1. Human Handoff Entity
- **Domain**: `server/src/modules/human-handoffs/domain/human-handoff.ts`
- **Entity**: `server/src/modules/human-handoffs/infrastructure/persistence/relational/entities/human-handoff.entity.ts`
- **Schema**:
```sql
CREATE TABLE human_handoff (
  id UUID PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  user_id INTEGER NULL,
  guest_id VARCHAR(255) NULL,
  admin_id INTEGER NULL,
  status ENUM('waiting', 'connected', 'ended', 'timeout') DEFAULT 'waiting',
  initial_message TEXT NOT NULL,
  user_profile JSONB NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NULL,
  ended_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Controller Endpoints
- **Base Path**: `/api/v1/human-handoff`

```typescript
POST   /request                    // Request human support
GET    /status/:conversationId     // Get handoff status
GET    /admin/notifications        // Get pending requests (admin only)
POST   /admin/accept/:sessionId    // Accept handoff (admin only)
POST   /end/:sessionId            // End handoff session
GET    /admin/sessions            // Get all sessions (admin only)
```

## Flow hoạt động

### 1. User Request Flow
1. User clicks suggestion "Chat ngay cán bộ tư vấn?"
2. Frontend checks `shouldTriggerHumanHandoff(message)`
3. If true, call `humanHandoffService.requestHumanSupport()`
4. Create handoff session with status "waiting"
5. Emit socket event to notify admins
6. Start 60-second countdown timer
7. Show waiting indicator to user

### 2. Admin Accept Flow
1. Admin receives real-time notification
2. Admin clicks "Nhận hỗ trợ" button
3. Update session status to "connected"
4. Emit socket event to notify user
5. Clear countdown timer
6. Show connected indicator

### 3. Timeout Flow
1. If no admin accepts within 60 seconds
2. Frontend automatically shows timeout message
3. Backend updates session status to "timeout"
4. User continues with chatbot

### 4. End Session Flow
1. Admin or system ends the session
2. Update session status to "ended"
3. Emit socket event
4. Show end message to user

## Socket.IO Events

### Client Events (Emit)
- `human-support-requested`: When user requests support
- `human-support-accepted`: When admin accepts request
- `human-support-ended`: When session ends

### Server Events (Listen)
- `human-support-accepted`: Admin accepted request
- `human-support-ended`: Session ended
- `human-support-timeout`: Session timed out
- `admin-notification`: New request for admin

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Constants
```typescript
// client/src/constants/common.ts
export const TRIGGER_CONTACT_CABINET = "Chat ngay cán bộ tư vấn?";

// Service timeout
const TIMEOUT_DURATION = 60000; // 60 seconds
```

## Usage Examples

### Frontend Integration

#### 1. In Chat Component
```typescript
import { useHumanHandoff, shouldTriggerHumanHandoff } from "@/hooks/useHumanHandoff";

const {
  requestHumanSupport,
  endHandoff,
  timeoutRemaining,
  isWaiting,
  isConnected,
  adminName,
} = useHumanHandoff({ conversationId });

const handleSuggestionClick = (suggestion: string) => {
  if (shouldTriggerHumanHandoff(suggestion)) {
    requestHumanSupport(suggestion);
    return;
  }
  // Continue with normal chat
};
```

#### 2. Indicator Component
```typescript
<HumanHandoffIndicator
  isWaiting={isWaiting}
  isConnected={isConnected}
  adminName={adminName}
  timeoutRemaining={timeoutRemaining}
  onEndHandoff={endHandoff}
/>
```

### Backend Integration

#### 1. Service Usage
```typescript
// Create handoff request
const session = await humanHandoffsService.create({
  conversationId: "conv-123",
  userId: 456,
  message: "Chat ngay cán bộ tư vấn?",
  userProfile: { name: "John", email: "john@example.com" }
});

// Get status
const status = await humanHandoffsService.getStatus("conv-123");

// Accept handoff (admin)
const updatedSession = await humanHandoffsService.acceptHandoff(sessionId, adminId);
```

## Testing

### Frontend Tests
```bash
# Run hook tests
npm test -- useHumanHandoff

# Run component tests
npm test -- HumanHandoffIndicator
npm test -- HumanHandoffManager
```

### Backend Tests
```bash
# Run service tests
npm test -- human-handoffs.service.spec.ts

# Run controller tests
npm test -- human-handoffs.controller.spec.ts

# Run e2e tests
npm run test:e2e -- human-handoffs
```

## Deployment Considerations

### Database Migration
```bash
# Create migration
npm run migration:create -- src/database/migrations/CreateHumanHandoffTable

# Run migration
npm run migration:run
```

### Socket.IO Setup
- Ensure Socket.IO server is configured for production
- Configure CORS settings
- Set up Redis adapter for multiple server instances

### Monitoring
- Monitor session success rate
- Track average response time
- Alert on high timeout rates

## Troubleshooting

### Common Issues

1. **Socket connection fails**
   - Check NEXT_PUBLIC_SOCKET_URL configuration
   - Verify server Socket.IO setup
   - Check CORS settings

2. **Timeout not working**
   - Verify setTimeout cleanup
   - Check component unmount handling
   - Ensure proper state management

3. **Admin notifications not received**
   - Check admin role permissions
   - Verify socket event emission
   - Test admin authentication

### Debug Commands
```bash
# Check socket connection
console.log(socket.connected);

# Monitor handoff status
console.log(humanHandoffService.getStatus(conversationId));

# Check admin notifications
console.log(humanHandoffService.useAdminNotifications());
```

## Future Enhancements

1. **Multiple Admin Support**: Allow multiple admins to see and accept requests
2. **Chat History**: Store and display chat history during handoff
3. **File Transfer**: Allow file sharing during human support
4. **Rating System**: Let users rate the support experience
5. **Analytics Dashboard**: Comprehensive reporting on handoff metrics
6. **Mobile App**: Dedicated mobile app for admin support

## API Documentation

Detailed API documentation is available at `/api/docs` when the server is running with Swagger enabled. 