# Release Notes v4.1.0 - Voice Chat Widget Enhancement

*Released: August 21, 2025*

## 🎉 Major Improvements

### ✅ Voice Chat Widget Completely Rebuilt
- **Fixed infinite connection loops** that were exhausting API quota
- **Removed auto-connection** - now user-controlled with Play button interface
- **Enhanced UX** with click-to-start voice chat (🎤 → 🔇 flow)
- **Larger face widget** - increased from 50px to 80px radius for better visibility
- **Better error handling** - clear connection status and error messages

### ✅ UI/UX Enhancements
- **Clean button interface** - removed cluttered waiting state buttons
- **Simplified activation** - single 🎤 Play button starts voice conversation
- **Visual feedback** - animated говорящий смайлик with volume indicators
- **Status messages** - clear "Click to start voice chat" → "Listening... Click to stop"

### ✅ Technical Improvements
- **Proper audio configuration** - `responseModalities: [Modality.AUDIO]` correctly implemented
- **Model compatibility** - using `gemini-2.5-flash-preview-native-audio-dialog`
- **Connection management** - manual connection control prevents quota exhaustion
- **Code cleanup** - removed unused auto-connection logic and deprecated files

## 🔧 Configuration Changes

### Voice Widget Setup
```typescript
// Now uses manual activation instead of auto-connect
const handleVoiceToggle = async () => {
  if (!connected) {
    await connect(); // User-initiated connection
    setMuted(false);  // Start voice recording
  }
};
```

### Removed Files
- `frontend/components/ChatWidget-NEW.tsx` - deprecated static model configuration

## 🚀 How to Use New Voice Chat

1. **Open Widget**: `http://localhost:5173/widget.html?agentId=devops-specialist`
2. **Select Voice Mode**: Click "Voice Chat" in introduction screen
3. **Start Conversation**: Click 🎤 Play button
4. **Wait for Ready**: Status shows "Listening... Click to stop"
5. **Speak Naturally**: AI responds with voice automatically
6. **Stop Chat**: Click 🔇 button to end conversation

## 🐛 Bug Fixes

- Fixed infinite connection attempts that exhausted API quota
- Resolved auto-connection hanging and stopping at "Connecting... (attempt 1/3)"
- Fixed missing audio configuration in widget vs frontend discrepancy
- Removed waiting state microphone buttons that caused UI confusion

## 🎯 Migration Notes

### For Existing Installations
- No configuration changes required
- Voice chat now requires manual activation (improved UX)
- Larger face widget provides better visual feedback
- Same API key configuration through admin panel

### For Developers
- Voice widget now follows same pattern as main frontend
- No auto-connection logic - user controls activation
- Clean separation between connection and voice recording states
- Better error handling and user feedback

## 🔜 Next Steps

- Consider adding voice chat customization options in admin panel
- Potential voice selection (different AI voices)
- Enhanced visual feedback and animations
- Mobile responsiveness improvements

---

**Full Changelog**: Compare changes between v4.0.0...v4.1.0
**Documentation**: Updated README.md and QUICK-REFERENCE.md with new voice chat instructions
