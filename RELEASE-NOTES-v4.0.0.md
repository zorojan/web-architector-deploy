# SDH Global AI Assistant v4.0.0 Release Notes

**Release Date:** August 19, 2025  
**Branch:** `v4-audio-widget`  
**Tag:** `v4.0.0`

## 🎉 Major Features

### ✅ Complete Audio Widget Implementation
- **Voice Chat**: Real-time voice conversations using Google Gemini Live API
- **говорящий смайлик**: Visual feedback through BasicFaceWidget during voice interactions
- **Dual Mode Widget**: Single component supporting both text and voice chat modes
- **Seamless Integration**: Widget matches main frontend architecture exactly

### ✅ Unified API Key Management
- **Centralized Backend Endpoint**: `/api/public/apikey` serves all components
- **No URL Parameters**: Eliminated API key exposure in URLs
- **Consistent Architecture**: Widget, frontend, and admin all use same backend source
- **Proper Error Handling**: Clear messages with admin panel links for configuration

### ✅ Comprehensive Documentation
- **[PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md)**: Complete architecture guide
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)**: 30-second setup and key info
- **[WIDGET-ARCHITECTURE.md](WIDGET-ARCHITECTURE.md)**: Widget implementation details
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**: Common issues and solutions

### ✅ Developer Experience Improvements
- **Windows Scripts**: `.bat` files for easy service management
  - `start-backend.bat` - Backend API server
  - `start-frontend.bat` - React frontend  
  - `start-admin.bat` - Next.js admin panel
  - `test-api.bat` - API health check
- **Automated Setup**: Database initialization with default data

## 🏗️ Technical Architecture

### Backend (Port 3001)
- **Node.js/Express API** with TypeScript
- **SQLite Database** with agents and settings tables
- **RESTful Endpoints** for all functionality
- **CORS Configuration** for development

### Frontend (Port 5173)
- **React 18** with Vite for fast development
- **TypeScript** for type safety
- **Gemini Live API Integration** with real-time streaming
- **Audio Worklets** for audio processing

### Admin Panel (Port 3000)
- **Next.js 13+** with app router
- **Agent Management** interface
- **Settings Configuration** for API keys
- **Widget Customization** options

### Widget System
- **Embeddable Component** for any website
- **Responsive Design** with multiple themes
- **Voice/Text Modes** in single interface
- **Error Boundaries** with helpful messaging

## 📊 Performance & Compatibility

- **Real-time Audio**: Low-latency voice streaming
- **Lightweight Widget**: Minimal bundle size for embedding
- **Cross-browser Support**: Modern browsers with WebRTC
- **Mobile Responsive**: Works on desktop and mobile devices

## 🔧 Installation & Usage

### Quick Start
```powershell
git clone https://github.com/zorojan/sdh-global-ai-assistant.git
cd sdh-global-ai-assistant
git checkout v4-audio-widget

# Start all services
.\start-backend.bat
.\start-frontend.bat  
.\start-admin.bat

# Configure API key at http://localhost:3000
```

### Widget Integration
```html
<div id="chat-widget"></div>
<script src="http://localhost:5173/widget.js"></script>
```

## 🐛 Known Issues & Limitations

- **Gemini API Quota**: Voice features limited by Google API quotas
- **WebRTC Requirements**: Voice chat requires modern browser support
- **Local Development**: Currently configured for localhost (production config needed)

## 🚀 What's Next

- **Production Deployment**: Azure/AWS configuration
- **Advanced Voice Features**: Interruption handling, voice customization
- **Analytics Integration**: Usage tracking and metrics
- **Multi-language Support**: Internationalization

## 📝 Changelog

### Added
- Complete voice chat implementation with Gemini Live API
- говорящий смайлик visual feedback system
- Unified API key management architecture
- Comprehensive project documentation
- Windows development scripts
- Widget embedding system
- Error boundaries with helpful messages

### Changed
- Refactored ChatWidget.tsx to match frontend pattern
- Updated README with proper navigation
- Simplified API key handling across all components
- Improved loading states and error handling

### Removed
- URL parameter API key dependencies
- Redundant API key management code
- Unused test endpoints and components
- Legacy shell scripts

## 👥 Contributors

**SDH Global Team**
- Complete audio widget architecture
- Voice chat implementation  
- Documentation and developer experience

---

**Repository**: https://github.com/zorojan/sdh-global-ai-assistant  
**Branch**: `v4-audio-widget`  
**Tag**: `v4.0.0`  
**Support**: [SDH.global](https://sdh.global)
