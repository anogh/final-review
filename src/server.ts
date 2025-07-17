import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { TranslationService } from './services/translationService';
import { AuthService } from './services/authService';
import { ChatMessage, TranslatedMessage, MessageWithMeta, ConnectedUser } from './types/chat';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const translationService = new TranslationService();
const authService = new AuthService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store connected users by user identity
const connectedUsers = new Map<string, ConnectedUser>();
const userConnections = {
  User1: new Set<string>(),
  User2: new Set<string>()
};

// Authentication endpoint
app.post('/api/auth', (req: Request, res: Response) => {
  const { password } = req.body;
  
  const authResult = authService.validatePassword(password);
  
  if (authResult.success) {
    res.json(authResult);
  } else {
    res.status(401).json(authResult);
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle authentication
  socket.on('authenticate', (password: string) => {
    const authResult = authService.validatePassword(password);
    
    if (authResult.success && authResult.userIdentity) {
      // Add user to connected users
      const user: ConnectedUser = {
        id: socket.id,
        authenticated: true,
        userIdentity: authResult.userIdentity,
        connectedAt: new Date().toISOString()
      };
      
      connectedUsers.set(socket.id, user);
      userConnections[authResult.userIdentity].add(socket.id);
      
      socket.emit('auth_success', {
        message: authResult.message,
        userIdentity: authResult.userIdentity
      });
      
      // Notify all users about current connection status
      const user1Count = userConnections.User1.size;
      const user2Count = userConnections.User2.size;
      
      io.emit('user_status', {
        user1Connections: user1Count,
        user2Connections: user2Count,
        totalConnections: user1Count + user2Count
      });
      
      console.log(`${authResult.userIdentity} authenticated (${socket.id}). User1: ${user1Count}, User2: ${user2Count}`);
    } else {
      socket.emit('auth_error', authResult.message);
      socket.disconnect();
    }
  });

  // Handle chat messages
  socket.on('chat_message', async (data: ChatMessage) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user || !user.authenticated) {
      socket.emit('error', 'Not authenticated');
      return;
    }

    try {
      console.log(`Message from ${user.userIdentity}:`, data);
      
      // Create message with timestamp and user info
      const messageWithMeta: MessageWithMeta = {
        ...data,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        userId: socket.id,
        userIdentity: user.userIdentity
      };

      // Automatically translate the message if it contains text
      if (data.text && data.text.trim()) {
        try {
          // Use the auto-translation method for Chinese-English bidirectional translation
          const translation = await translationService.autoTranslateChineseEnglish(data.text);
          
          messageWithMeta.translation = {
            originalText: data.text,
            translatedText: translation.translatedText,
            sourceLanguage: translation.detectedLanguage || 'auto',
            targetLanguage: translation.detectedLanguage?.startsWith('zh') ? 'en' : 'zh-CN'
          };
          
          console.log(`Auto-translation for ${user.userIdentity}:`, messageWithMeta.translation);
        } catch (translationError) {
          console.error('Auto-translation failed:', translationError);
          // Continue without translation if it fails
        }
      }

      // Broadcast message to all authenticated users
      io.emit('message_received', messageWithMeta);
      console.log(`Message from ${user.userIdentity} broadcasted to all users`);
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', 'Failed to process message');
    }
  });

  // Handle file uploads (images)
  socket.on('file_upload', (data: { fileName: string; fileData: string; fileType: string }) => {
    const user = connectedUsers.get(socket.id);
    
    if (!user || !user.authenticated) {
      socket.emit('error', 'Not authenticated');
      return;
    }

    // Broadcast file to all users
    const fileMessage: MessageWithMeta = {
      id: Date.now().toString(),
      type: 'file' as const,
      fileName: data.fileName,
      fileData: data.fileData,
      fileType: data.fileType,
      timestamp: new Date().toISOString(),
      userId: socket.id,
      userIdentity: user.userIdentity
    };

    io.emit('message_received', fileMessage);
    console.log(`File shared by ${user.userIdentity}: ${data.fileName}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    
    if (user) {
      // Remove from user connections
      userConnections[user.userIdentity].delete(socket.id);
      connectedUsers.delete(socket.id);
      
      // Notify all users about updated connection status
      const user1Count = userConnections.User1.size;
      const user2Count = userConnections.User2.size;
      
      io.emit('user_status', {
        user1Connections: user1Count,
        user2Connections: user2Count,
        totalConnections: user1Count + user2Count
      });
      
      console.log(`${user.userIdentity} disconnected (${socket.id}). User1: ${user1Count}, User2: ${user2Count}`);
    } else {
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const user1Count = userConnections.User1.size;
  const user2Count = userConnections.User2.size;
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    connections: {
      user1: user1Count,
      user2: user2Count,
      total: user1Count + user2Count
    }
  });
});

// Serve the main page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Chat app available at: http://localhost:${PORT}`);
  console.log(`👤 User 1 password: ${process.env.USER1_PASSWORD || 'user1pass'}`);
  console.log(`👤 User 2 password: ${process.env.USER2_PASSWORD || 'user2pass'}`);
});

export default app;