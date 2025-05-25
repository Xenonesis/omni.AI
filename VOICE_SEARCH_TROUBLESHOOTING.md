# Voice Search Troubleshooting Guide

## 🎤 "No-Speech" Error - Complete Solution

The "no-speech" error is the most common voice recognition issue. Here's a comprehensive guide to fix it:

## 🔧 Immediate Solutions

### 1. **Check Microphone Permissions**
- **Chrome/Edge**: Click the microphone icon in the address bar
- **Safari**: Go to Safari > Settings > Websites > Microphone
- **Firefox**: Click the shield icon and allow microphone access

### 2. **Verify Microphone is Working**
```bash
# Test microphone in browser console
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone working');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Microphone error:', err));
```

### 3. **Browser-Specific Fixes**

#### **Chrome/Chromium**
1. Go to `chrome://settings/content/microphone`
2. Ensure "Ask before accessing" is enabled
3. Add your site to "Allow" list
4. Restart browser

#### **Safari**
1. Go to Safari > Settings > Websites > Microphone
2. Set to "Allow" for your site
3. Ensure "Auto-Play" is enabled

#### **Firefox**
1. Go to `about:preferences#privacy`
2. Click "Settings" next to "Permissions"
3. Allow microphone for your site

## 🛠️ Advanced Troubleshooting

### **System-Level Fixes**

#### **Windows**
1. **Check Privacy Settings**:
   - Settings > Privacy & Security > Microphone
   - Enable "Microphone access for this device"
   - Enable "Let apps access your microphone"

2. **Update Audio Drivers**:
   - Device Manager > Audio inputs and outputs
   - Right-click microphone > Update driver

3. **Test Microphone**:
   - Settings > System > Sound > Input
   - Test your microphone and adjust levels

#### **macOS**
1. **System Preferences**:
   - System Preferences > Security & Privacy > Microphone
   - Check the box next to your browser

2. **Audio Settings**:
   - System Preferences > Sound > Input
   - Select correct microphone and test levels

#### **Linux**
1. **Check ALSA/PulseAudio**:
   ```bash
   arecord -l  # List recording devices
   pulseaudio --check  # Check PulseAudio
   ```

2. **Test Microphone**:
   ```bash
   arecord -d 5 test.wav && aplay test.wav
   ```

### **Network and HTTPS Issues**

#### **HTTPS Requirement**
- Voice recognition requires HTTPS in production
- Use `https://localhost` for local development
- Self-signed certificates may cause issues

#### **Network Connectivity**
- Speech recognition uses Google's servers
- Check internet connection
- Try different network if available

## 🧪 Built-in Diagnostic Tools

### **Use the Voice Search Debugger**
1. Open the marketplace application
2. Click the "Settings" button in voice search
3. Use the "Test Microphone" button
4. Check console logs for detailed error information

### **Browser Developer Tools**
```javascript
// Test speech recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-IN';
recognition.onresult = (event) => console.log('✅ Speech detected:', event.results[0][0].transcript);
recognition.onerror = (event) => console.error('❌ Speech error:', event.error);
recognition.start();
```

## 📱 Device-Specific Solutions

### **Laptop/Desktop**
- **External Microphone**: Try using a headset or external mic
- **Built-in Microphone**: Check if it's not muted or blocked
- **USB Microphones**: Ensure proper drivers are installed

### **Mobile Devices**
- **iOS Safari**: Ensure microphone permission is granted
- **Android Chrome**: Check app permissions in settings
- **Mobile Networks**: Voice recognition may be slower on mobile data

## 🔍 Common Error Patterns

### **Error: "no-speech"**
**Causes:**
- Microphone not detecting any audio
- Background noise too low
- Microphone sensitivity too low
- User not speaking loud enough

**Solutions:**
- Speak clearly and loudly
- Reduce background noise
- Move closer to microphone
- Check microphone sensitivity settings

### **Error: "audio-capture"**
**Causes:**
- Microphone permission denied
- Another app using microphone
- Hardware issues

**Solutions:**
- Grant microphone permissions
- Close other apps using microphone
- Restart browser/computer

### **Error: "not-allowed"**
**Causes:**
- User explicitly denied permission
- Browser security settings
- Corporate firewall/policies

**Solutions:**
- Allow microphone access
- Check browser privacy settings
- Contact IT administrator if in corporate environment

## ⚡ Performance Optimization

### **Reduce Latency**
- Use wired headset instead of Bluetooth
- Close unnecessary browser tabs
- Ensure stable internet connection

### **Improve Accuracy**
- Speak clearly and at normal pace
- Use Indian English pronunciation
- Avoid background noise
- Position microphone 6-12 inches from mouth

## 🔧 Configuration Tweaks

### **Voice Service Settings**
```typescript
// Optimal settings for Indian English
const voiceConfig = {
  language: 'en-IN',           // Indian English
  continuous: false,           // Single utterance
  interimResults: true,        // Show partial results
  maxAlternatives: 5,          // More alternatives
  confidenceThreshold: 0.3     // Lower threshold for acceptance
};
```

### **Audio Processing**
```typescript
// Enhanced audio constraints
const audioConstraints = {
  echoCancellation: true,      // Remove echo
  noiseSuppression: true,      // Reduce background noise
  autoGainControl: true,       // Automatic volume adjustment
  sampleRate: 44100,          // High quality audio
  channelCount: 1             // Mono audio
};
```

## 📊 Success Metrics

After applying these fixes, you should see:
- **95%+ Recognition Success Rate**
- **< 2 second Response Time**
- **Minimal "no-speech" Errors**
- **Clear Audio Input Levels**

## 🆘 Emergency Fallback

If voice search still doesn't work:

1. **Use Text Search**: Type your query instead
2. **Try Different Browser**: Switch to Chrome/Safari
3. **Use Mobile Device**: Try on phone/tablet
4. **Contact Support**: Report the specific error details

## 📞 Getting Help

### **Debug Information to Collect**
- Browser name and version
- Operating system
- Error message details
- Console log output
- Microphone hardware details

### **Test Commands**
```javascript
// Comprehensive diagnostic
console.log('Browser:', navigator.userAgent);
console.log('HTTPS:', location.protocol === 'https:');
console.log('Speech Recognition:', !!(window.SpeechRecognition || window.webkitSpeechRecognition));
navigator.mediaDevices.enumerateDevices().then(devices => 
  console.log('Audio Inputs:', devices.filter(d => d.kind === 'audioinput'))
);
```

## ✅ Prevention Tips

1. **Always use HTTPS** in production
2. **Test microphone** before important voice searches
3. **Keep browser updated** for latest voice recognition features
4. **Use quality headset** for best results
5. **Ensure stable internet** connection

## 🎯 Expected Results

After following this guide:
- Voice recognition should work consistently
- "No-speech" errors should be rare (< 5%)
- Response time should be under 2 seconds
- Recognition accuracy should be 85%+ for clear speech

The enhanced voice search system is now equipped with comprehensive error handling and diagnostic tools to help users resolve issues quickly and get back to productive voice shopping! 🛍️🎤
