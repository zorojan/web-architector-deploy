# SDH Global AI Assistant - Project Overview

## 🏗️ Architecture Overview

**Multi-service React/Node.js AI Assistant with voice chat capabilities**

### Core Services
1. **Backend** (Port 3001) - Node.js/Express API server
2. **Frontend** (Port 5173) - React/Vite main application  
3. **Admin Panel** (Port 3000) - Next.js configuration interface
4. **Widget** - Embeddable chat widget for websites

---

## 📁 Project Structure

```
sdh-global-ai-assistant/
├── 📄 Launch Scripts
│   ├── start-backend.bat     # Starts Node.js API server
│   ├── start-frontend.bat    # Starts React frontend
│   ├── start-admin.bat       # Starts Next.js admin
│   └── test-api.bat          # API health check
│
├── 🔧 backend/               # Node.js/Express API (Port 3001)
│   ├── src/
│   │   ├── server.ts         # Main server file
│   │   ├── database/init.ts  # SQLite setup
│   │   └── routes/           # API endpoints
│   │       ├── agents.ts     # AI agents management
│   │       ├── auth.ts       # Authentication
│   │       └── settings.ts   # Configuration
│   └── database.sqlite       # SQLite database
│
├── 🎨 frontend/              # React/Vite App (Port 5173)
│   ├── App.tsx               # Main application
│   ├── widget.tsx            # Widget entry point
│   ├── components/
│   │   ├── ChatWidget.tsx    # Main widget component
│   │   ├── VoiceChatWidget.tsx # Voice functionality
│   │   └── demo/             # Demo components
│   ├── contexts/
│   │   ├── LiveAPIContext.tsx # Gemini Live API context
│   │   └── LiveAPIContextWidget.tsx # Widget context
│   └── lib/
│       ├── genai-live-client.ts # Gemini API client
│       └── api-client.ts     # Backend API client
│
├── ⚙️ admin-panel/           # Next.js Admin (Port 3000)
│   └── src/
│       ├── app/              # Next.js 13+ app router
│       └── components/       # Admin UI components
│
├── 🌐 wordpress-plugin/      # WordPress integration
│   ├── sdh-ai-assistant.php  # Main plugin file
│   └── includes/             # Plugin classes
│
└── 📋 Documentation
    ├── README.md             # Main documentation
    ├── WIDGET-ARCHITECTURE.md # Widget structure guide
    └── PROJECT-OVERVIEW.md   # This file
```

---

## 🔑 Key Components

### Backend API (src/server.ts)
```typescript
// Main endpoints:
GET  /api/health              # Health check
GET  /api/public/apikey       # Get Gemini API key
GET  /api/public/agents       # List available agents
POST /api/agents/chat         # Chat with agent
```

### Frontend App (App.tsx)
```typescript
// Main application with:
- LiveAPIProvider context     # Gemini Live API setup
- fetchApiKey() function      # Get API key from backend
- Voice/Text chat modes       # Unified chat interface
```

### Chat Widget (ChatWidget.tsx)
```typescript
// Embeddable widget with:
- Same API key management as main app
- Text and voice modes
- Customizable styling
- Error handling with admin panel links
```

### Admin Panel
```typescript
// Configuration interface for:
- Agent management
- API key settings
- Widget customization
```

---

## 🚀 Quick Start Commands

```powershell
# Start all services
.\start-backend.bat    # Terminal 1 - API server
.\start-frontend.bat   # Terminal 2 - React app  
.\start-admin.bat      # Terminal 3 - Admin panel

# Test API health
.\test-api.bat

# Access points:
# Frontend:    http://localhost:5173
# Admin Panel: http://localhost:3000  
# Widget:      http://localhost:5173/widget.html
```

---

## 🎯 Current Status (August 2025)

### ✅ Working Features
- **Backend API**: All endpoints functional
- **Frontend App**: Text and voice chat working
- **Admin Panel**: Agent and settings management
- **Widget**: Unified with frontend architecture
- **Database**: SQLite with agents and settings tables
- **Voice Chat**: Gemini Live API integration with говорящий смайлик

### 🔧 Key Technical Details
- **API Key Management**: Centralized through `/api/public/apikey` endpoint
- **Voice Integration**: Uses LiveAPIContext with BasicFaceWidget
- **Database**: SQLite with automatic initialization
- **Widget Architecture**: Matches frontend App.tsx pattern exactly

### 📝 Recent Changes
- Unified widget API key management with frontend
- Removed URL parameter dependencies
- Added proper loading/error states
- Created comprehensive documentation

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```powershell
# Kill existing processes
taskkill /f /im node.exe
taskkill /f /im nodemon.exe
```

### API Key Not Found
1. Open Admin Panel: http://localhost:3000
2. Navigate to Settings tab
3. Configure Gemini API key

### Widget Not Loading
- Check backend is running on port 3001
- Verify API key is configured
- Check browser console for errors

---

## 📊 Service Dependencies

```
Widget ──┐
         ├─── Backend API (3001) ──── SQLite Database
Frontend ┘                      └─── Gemini Live API

Admin Panel (3000) ──── Backend API (3001)
```

---

## 🎨 Widget Integration

### HTML Embedding
```html
<div id="chat-widget"></div>
<script>
  window.chatWidgetConfig = {
    agentId: 'ai-advisor',
    theme: 'light',
    position: 'bottom-right'
  };
</script>
<script src="http://localhost:5173/widget.js"></script>
```

### WordPress Plugin
- Install `wordpress-plugin/` folder
- Configure through WordPress admin
- Widget automatically embedded

---

## 📈 Performance Notes

- **Backend**: Express.js with SQLite (fast for small-medium loads)
- **Frontend**: Vite for fast development and optimized builds
- **Voice**: Real-time streaming with Gemini Live API
- **Widget**: Lightweight, loads independently

---

## 🔒 Security Considerations

- API key stored in backend database only
- No API keys exposed in frontend code
- CORS configured for local development
- Authentication system in place for admin functions

---

## 📚 File Locations for Quick Access

### Configuration Files
- `backend/src/server.ts` - Main API server
- `frontend/App.tsx` - Main React application  
- `frontend/components/ChatWidget.tsx` - Widget component
- `admin-panel/src/app/page.tsx` - Admin interface

### Database
- `backend/database.sqlite` - All data storage
- `backend/src/database/init.ts` - Database schema

### Documentation
- `README.md` - Main project documentation
- `WIDGET-ARCHITECTURE.md` - Widget implementation guide
- `TROUBLESHOOTING.md` - Common issues and solutions

---

*Last Updated: August 19, 2025*
*Project Status: Fully functional with voice capabilities*
