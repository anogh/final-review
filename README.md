# Private 2-User Chat Application

A secure, real-time chat application built with TypeScript, Node.js, Express, and Socket.IO. Features **automatic bidirectional Chinese-English translation** using Google Cloud Translation API and supports text + image sharing between **two distinct users** with **separate passwords** and **unlimited device logins per user**.

## 🌟 Features

- **Real-time messaging** with Socket.IO
- **2-User System** - Two distinct users (User1 & User2) with separate passwords
- **Multiple device support** - Each user can login from unlimited devices simultaneously
- **Automatic Chinese ⇄ English translation** - messages are automatically translated both ways
- **Smart language detection** - automatically detects Chinese vs English text
- **Dual message display** - shows both original and translated text to both users
- **User identification** - Clear visual distinction between User1 and User2 messages
- **Image sharing** support (up to 5MB)
- **Password protection** with separate credentials for each user
- **Beautiful, responsive UI** with modern design and user-specific styling
- **HTTPS/WSS compatible** for cloud deployment
- **No database required** - simple and lightweight

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=3000
USER1_PASSWORD=your_user1_password_here
USER2_PASSWORD=your_user2_password_here
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
DEFAULT_SOURCE_LANGUAGE=auto
DEFAULT_TARGET_LANGUAGE=en
NODE_ENV=development
```

### 3. Get Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Cloud Translation API"
4. Go to IAM & Admin → Service Accounts
5. Create a service account with "Cloud Translation API User" role
6. Generate a JSON key file
7. Copy the entire JSON content to `GOOGLE_APPLICATION_CREDENTIALS_JSON` in `.env`

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Start the server
npm start

# For development (with auto-reload)
npm run dev
```

### 5. Access the Chat

Open your browser and go to:
- Local: `http://localhost:3000`
- **User1**: Enter the password set in `USER1_PASSWORD`
- **User2**: Enter the password set in `USER2_PASSWORD`
- Each user can login from multiple devices simultaneously
- Start chatting in Chinese or English - automatic translation happens!

## 🌐 Deployment to Render.com

### Quick Deploy with render.yaml

This project includes a `render.yaml` file for easy deployment:

1. **Push to GitHub**: Commit your code to a GitHub repository
2. **Connect to Render**: Link your GitHub repo to Render.com
3. **Set Environment Variables**: Add the required variables (see below)
4. **Deploy**: Render will automatically build and deploy

### Environment Variables for Render

Add these in your Render dashboard:

```env
NODE_ENV=production
PORT=10000
USER1_PASSWORD=your_secure_user1_password
USER2_PASSWORD=your_secure_user2_password
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
DEFAULT_SOURCE_LANGUAGE=auto
DEFAULT_TARGET_LANGUAGE=en
```

### Manual Deployment Steps

1. **Create Web Service** on Render.com
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Add Environment Variables** (see above)

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## 📱 Usage

### Authentication
- **User1**: Enter the password set in `USER1_PASSWORD`
- **User2**: Enter the password set in `USER2_PASSWORD`
- Each user can connect from unlimited devices simultaneously
- User identity is clearly displayed in the chat interface

### User Interface
- **User1 messages**: Blue theme with distinct styling
- **User2 messages**: Green theme with distinct styling
- **Header display**: Shows current user identity and connection status
- **Real-time status**: See how many devices each user has connected

### Sending Messages
- Type your message and press Enter or click Send
- Messages are automatically translated between Chinese and English
- Both original and translated text are displayed
- User identity is clearly shown with each message

### Sharing Images
- Click the image icon to upload photos
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Images are shared with user identity information

## 🛠️ Technical Architecture

### Backend (TypeScript + Node.js)
- **Express.js** - HTTP server and static file serving
- **Socket.IO** - Real-time WebSocket communication
- **Google Translate API v2** - Message translation
- **Axios** - HTTP client for API calls
- **dotenv** - Environment variable management

### Frontend (Vanilla JavaScript)
- **Socket.IO Client** - Real-time communication
- **Modern CSS** - Responsive design with gradients and animations
- **File API** - Image upload handling
- **Responsive Design** - Mobile-friendly interface

### Key Components
- `src/server.ts` - Main Express server with Socket.IO
- `src/services/translationService.ts` - Google Translate integration
- `src/services/authService.ts` - Password authentication
- `src/types/chat.ts` - TypeScript type definitions
- `public/index.html` - Frontend interface
- `public/js/chat.js` - Frontend JavaScript logic

## 🔒 Security Features

- Password-protected access
- Input sanitization and validation
- File type and size restrictions
- CORS configuration
- Environment variable protection

## 🌍 China Compatibility

- Server-side translation (Google Translate works from server)
- HTTPS/WSS support for firewall compatibility
- Optimized for cloud deployment accessible in mainland China

## 📋 API Endpoints

- `GET /` - Main chat interface
- `POST /api/auth` - Password authentication
- `GET /api/health` - Health check endpoint
- `WebSocket /socket.io/` - Real-time communication

## 🔧 Development

### Project Structure
```
├── src/
│   ├── server.ts              # Main server file
│   ├── services/
│   │   ├── translationService.ts
│   │   └── authService.ts
│   └── types/
│       └── chat.ts
├── public/
│   ├── index.html
│   └── js/
│       └── chat.js
├── dist/                      # Compiled TypeScript
├── package.json
├── tsconfig.json
└── .env
```

### Available Scripts
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run dev` - Start development server with ts-node
- `npm run watch` - Watch TypeScript files for changes

## 🐛 Troubleshooting

### Translation Not Working
- Verify Google Translate API key is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is set up for Google Cloud project

### Connection Issues
- Check firewall settings
- Verify WebSocket support
- Try different port if 3000 is blocked

### Authentication Problems
- Verify CHAT_PASSWORD in .env file
- Check password doesn't contain special characters
- Clear browser cache and cookies

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs in browser console
3. Verify environment variables are set correctly

---

**Enjoy your private, secure chat experience! 💬🔒**