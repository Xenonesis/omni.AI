/**
 * Microphone Test Utility
 * Helps diagnose and fix voice recognition issues
 */

export interface MicrophoneTestResult {
  isSupported: boolean;
  hasPermission: boolean;
  isWorking: boolean;
  audioLevel: number;
  deviceInfo: MediaDeviceInfo | null;
  issues: string[];
  suggestions: string[];
}

export class MicrophoneTest {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private isMonitoring = false;

  /**
   * Comprehensive microphone test
   */
  async runTest(): Promise<MicrophoneTestResult> {
    const result: MicrophoneTestResult = {
      isSupported: false,
      hasPermission: false,
      isWorking: false,
      audioLevel: 0,
      deviceInfo: null,
      issues: [],
      suggestions: []
    };

    // Test 1: Check browser support
    result.isSupported = this.checkBrowserSupport();
    if (!result.isSupported) {
      result.issues.push('Browser does not support speech recognition');
      result.suggestions.push('Use Chrome, Edge, or Safari for best voice recognition support');
      return result;
    }

    // Test 2: Check microphone permission
    try {
      result.hasPermission = await this.checkPermission();
      if (!result.hasPermission) {
        result.issues.push('Microphone permission denied');
        result.suggestions.push('Grant microphone permission in browser settings');
        result.suggestions.push('Click the microphone icon in the address bar');
        return result;
      }
    } catch (error) {
      result.issues.push(`Permission check failed: ${error}`);
      result.suggestions.push('Check browser security settings');
      return result;
    }

    // Test 3: Test microphone functionality
    try {
      const audioTest = await this.testAudioInput();
      result.isWorking = audioTest.isWorking;
      result.audioLevel = audioTest.audioLevel;
      result.deviceInfo = audioTest.deviceInfo;

      if (!result.isWorking) {
        result.issues.push('Microphone is not detecting audio');
        result.suggestions.push('Check if microphone is muted');
        result.suggestions.push('Try speaking louder');
        result.suggestions.push('Check microphone connection');
      }
    } catch (error) {
      result.issues.push(`Audio test failed: ${error}`);
      result.suggestions.push('Try refreshing the page');
      result.suggestions.push('Check if another app is using the microphone');
    }

    return result;
  }

  /**
   * Check if browser supports speech recognition
   */
  private checkBrowserSupport(): boolean {
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Check microphone permission
   */
  private async checkPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test audio input functionality
   */
  private async testAudioInput(): Promise<{
    isWorking: boolean;
    audioLevel: number;
    deviceInfo: MediaDeviceInfo | null;
  }> {
    try {
      // Get microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Get device info
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const deviceInfo = audioInputs.length > 0 ? audioInputs[0] : null;

      // Set up audio analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.analyser.fftSize = 256;
      this.microphone.connect(this.analyser);

      // Monitor audio level for 3 seconds
      const audioLevel = await this.monitorAudioLevel(3000);
      
      // Cleanup
      this.cleanup();

      return {
        isWorking: audioLevel > 0,
        audioLevel,
        deviceInfo
      };
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  /**
   * Monitor audio level for specified duration
   */
  private async monitorAudioLevel(duration: number): Promise<number> {
    return new Promise((resolve) => {
      if (!this.analyser) {
        resolve(0);
        return;
      }

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let maxLevel = 0;
      let samples = 0;
      
      const startTime = Date.now();
      
      const checkLevel = () => {
        if (Date.now() - startTime >= duration) {
          resolve(maxLevel);
          return;
        }

        if (this.analyser) {
          this.analyser.getByteFrequencyData(dataArray);
          
          // Calculate average audio level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          maxLevel = Math.max(maxLevel, average);
          samples++;
        }

        requestAnimationFrame(checkLevel);
      };

      checkLevel();
    });
  }

  /**
   * Start real-time audio level monitoring
   */
  async startMonitoring(callback: (level: number) => void): Promise<void> {
    if (this.isMonitoring) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      this.analyser.fftSize = 256;
      this.microphone.connect(this.analyser);
      
      this.isMonitoring = true;
      
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const monitor = () => {
        if (!this.isMonitoring || !this.analyser) return;
        
        this.analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        callback(average);
        requestAnimationFrame(monitor);
      };
      
      monitor();
    } catch (error) {
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.microphone = null;
  }

  /**
   * Get available audio input devices
   */
  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  /**
   * Test speech recognition specifically
   */
  async testSpeechRecognition(): Promise<{
    isWorking: boolean;
    error?: string;
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    
    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        return {
          isWorking: false,
          error: 'Speech recognition not supported',
          suggestions: ['Use Chrome, Edge, or Safari', 'Enable speech recognition in browser settings']
        };
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          recognition.stop();
          resolve({
            isWorking: false,
            error: 'Speech recognition timeout',
            suggestions: ['Speak immediately after clicking microphone', 'Check microphone permissions']
          });
        }, 5000);

        recognition.onresult = () => {
          clearTimeout(timeout);
          recognition.stop();
          resolve({
            isWorking: true,
            suggestions: ['Speech recognition is working correctly']
          });
        };

        recognition.onerror = (event) => {
          clearTimeout(timeout);
          let errorSuggestions = ['Try refreshing the page'];
          
          switch (event.error) {
            case 'no-speech':
              errorSuggestions = ['Speak clearly into the microphone', 'Reduce background noise'];
              break;
            case 'not-allowed':
              errorSuggestions = ['Grant microphone permission', 'Check browser privacy settings'];
              break;
            case 'network':
              errorSuggestions = ['Check internet connection', 'Try again later'];
              break;
          }
          
          resolve({
            isWorking: false,
            error: `Speech recognition error: ${event.error}`,
            suggestions: errorSuggestions
          });
        };

        recognition.start();
      });
    } catch (error) {
      return {
        isWorking: false,
        error: `Failed to test speech recognition: ${error}`,
        suggestions: ['Check browser compatibility', 'Try refreshing the page']
      };
    }
  }
}

// Export singleton instance
export const microphoneTest = new MicrophoneTest();
