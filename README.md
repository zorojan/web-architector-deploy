# SDH Global AI Assistant

A powerful AI assistant platform with voice chat capabilities, built with React, Node.js, and integrated with Google's Gemini Live API.

## 📚 Quick Navigation

- **[🚀 Quick Reference](QUICK-REFERENCE.md)** - 30-second setup and key info
- **[🏗️ Project Overview](PROJECT-OVERVIEW.md)** - Complete architecture guide  
- **[🎨 Widget Architecture](WIDGET-ARCHITECTURE.md)** - Widget implementation details
- **[🔧 Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

## Features

- 🗣️ **Voice Chat**: Real-time voice conversations with AI using говорящий смайлик
- 💬 **Text Chat**: Traditional text-based conversations  
- 🤖 **Multiple AI Agents**: Specialized agents for different use cases
- 🎨 **Customizable Widget**: Embeddable chat widget for websites
- ⚙️ **Admin Panel**: Easy configuration and management
- 🔌 **WordPress Plugin**: Simple WordPress integration

**SDH Global**: A community of software engineers helping startups succeed. 

For support, get in touch at [www.SDH.global](https://www.SDH.global).

## 🚀 Quick Start

**Prerequisites:** Node.js installed

### 1. Start All Services
```powershell
# Terminal 1 - Backend API (Port 3001)
.\start-backend.bat

# Terminal 2 - Frontend App (Port 5173)  
.\start-frontend.bat

# Terminal 3 - Admin Panel (Port 3000)
.\start-admin.bat
```

### 2. Configure API Key
1. Open Admin Panel: http://localhost:3000
2. Go to Settings tab
3. Enter your Gemini API key

### 3. Test the System
```powershell
# Test API health
.\test-api.bat

# Access applications:
# Frontend App: http://localhost:5173
# Admin Panel:  http://localhost:3000
# Widget Demo:  http://localhost:5173/widget.html
```

## 📁 Project Structure

- **backend/** - Node.js/Express API server (Port 3001)
- **frontend/** - React/Vite main application (Port 5173)
- **admin-panel/** - Next.js configuration interface (Port 3000)
- **wordpress-plugin/** - WordPress integration files
- **shared/** - Common TypeScript types

## 🎯 Key Components

### Chat Widget
Embeddable widget that can be integrated into any website:
```html
<div id="chat-widget"></div>
<script src="http://localhost:5173/widget.js"></script>
```

### Voice Chat
Real-time voice conversations with AI using Google's Gemini Live API and visual feedback through говорящий смайлик.

### Multi-Agent System
Specialized AI agents for different purposes:
- AI Advisor - General assistance
- DevOps Specialist - Technical support  
- Custom agents via admin panel
