# SDH Global AI Assistant - Quick Architecture Reference

## 🚀 30-Second Setup
```powershell
cd c:\sdh\fsm\sdh-global-ai-assistant
.\start-backend.bat    # Port 3001 - API
.\start-frontend.bat   # Port 5173 - React App
.\start-admin.bat      # Port 3000 - Admin Panel
```

## 🏗️ Service Map
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Frontend App  │    │  Chat Widget    │
│   (Next.js)     │    │   (React/Vite)  │    │   (Embedded)    │
│   Port 3000     │    │   Port 5173     │    │   localhost     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │    Backend API Server   │
                    │    (Node.js/Express)    │
                    │       Port 3001         │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │    SQLite Database      │
                    │   (agents, settings)    │
                    └─────────────────────────┘
```

## 🔑 Key Files to Know
| Component | File | Purpose |
|-----------|------|---------|
| **Backend** | `backend/src/server.ts` | Main API server |
| **Frontend** | `frontend/App.tsx` | Main React app |
| **Widget** | `frontend/components/ChatWidget.tsx` | Embeddable widget |
| **Admin** | `admin-panel/src/app/page.tsx` | Configuration UI |
| **Database** | `backend/database.sqlite` | Data storage |

## 🎯 API Endpoints
```
GET  /api/health              # Server status
GET  /api/public/apikey       # Get Gemini API key  
GET  /api/public/agents       # List AI agents
POST /api/agents/chat         # Send chat message
```

## 🔧 Common Tasks

### Add New Agent
1. Backend: `backend/src/database/init.ts` - Add to agents table
2. Frontend: Agent selector will auto-update

### Configure API Key
1. Admin Panel: http://localhost:3000 → Settings
2. Or Backend: Direct SQLite update in settings table

### Embed Widget
```html
<div id="chat-widget"></div>
<script src="http://localhost:5173/widget.js"></script>
```

### Debug Issues
1. Check `.\test-api.bat` for backend health
2. Browser console for frontend errors
3. Widget loads from backend API key endpoint

## 🎨 Voice Chat Features
- **Gemini Live API** integration with model `gemini-2.5-flash-preview-native-audio-dialog`
- **Click-to-start interface** - user controls voice activation with 🎤 Play button
- **говорящий смайлик** (BasicFaceWidget 80px) for visual feedback during conversation
- **Real-time streaming** audio conversation with volume indicators
- **Unified API key** management through backend
- **No auto-connection** - prevents quota exhaustion and connection loops

### Voice Chat Usage
```
1. http://localhost:5173/widget.html?agentId=devops-specialist
2. Select "Voice Chat" mode
3. Click 🎤 button → Status: "Listening... Click to stop"
4. Speak naturally → AI responds with voice
5. Click 🔇 to stop
```

---
*Generated: August 19, 2025 - For rapid project onboarding*
