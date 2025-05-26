/**
 * Voice Recognition Manager - Singleton to prevent multiple recognition instances
 * Fixes the "InvalidStateError: Failed to execute 'start' on 'SpeechRecognition': recognition has already started" error
 */

interface VoiceRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean, confidence: number) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

interface VoiceRecognitionConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class VoiceRecognitionManager {
  private static instance: VoiceRecognitionManager;
  private recognition: SpeechRecognition | null = null;
  private isActive: boolean = false;
  private currentCallbacks: VoiceRecognitionCallbacks = {};
  private config: VoiceRecognitionConfig = {
    language: 'en-IN',
    continuous: false,
    interimResults: true,
    maxAlternatives: 3
  };

  private constructor() {
    this.initializeRecognition();
  }

  static getInstance(): VoiceRecognitionManager {
    if (!VoiceRecognitionManager.instance) {
      VoiceRecognitionManager.instance = new VoiceRecognitionManager();
    }
    return VoiceRecognitionManager.instance;
  }

  private initializeRecognition(): void {
    if (!this.isSupported()) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.recognition.onstart = () => {
      console.log('🎤 Voice Recognition Manager: Started');
      this.isActive = true;
      this.currentCallbacks.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let maxConfidence = 0;

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;

        maxConfidence = Math.max(maxConfidence, confidence);

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const transcript = finalTranscript || interimTranscript;
      const isFinal = !!finalTranscript;

      this.currentCallbacks.onResult?.(transcript, isFinal, maxConfidence);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('🎤 Voice Recognition Manager Error:', event.error);
      this.isActive = false;

      let errorMessage = '';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone access denied or not available.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      this.currentCallbacks.onError?.(errorMessage);
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice Recognition Manager: Ended');
      this.isActive = false;
      this.currentCallbacks.onEnd?.();
    };
  }

  public async startListening(
    callbacks: VoiceRecognitionCallbacks = {},
    config: Partial<VoiceRecognitionConfig> = {}
  ): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported in this browser');
    }

    // If already active, stop first
    if (this.isActive) {
      console.log('🎤 Voice Recognition Manager: Stopping existing session');
      await this.stopListening();
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Update configuration if provided
    this.config = { ...this.config, ...config };
    this.currentCallbacks = callbacks;

    // Reinitialize with new config if needed
    if (config.language || config.continuous !== undefined || 
        config.interimResults !== undefined || config.maxAlternatives) {
      this.setupRecognition();
    }

    try {
      if (!this.recognition) {
        throw new Error('Speech recognition not initialized');
      }

      console.log('🎤 Voice Recognition Manager: Starting with config:', this.config);
      this.recognition.start();
    } catch (error: any) {
      this.isActive = false;
      const errorMessage = `Failed to start voice recognition: ${error.message}`;
      console.error('🎤 Voice Recognition Manager:', errorMessage);
      this.currentCallbacks.onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public async stopListening(): Promise<void> {
    if (!this.recognition) return;

    return new Promise((resolve) => {
      if (!this.isActive) {
        resolve();
        return;
      }

      // Set up a timeout to ensure we don't wait forever
      const timeout = setTimeout(() => {
        console.warn('🎤 Voice Recognition Manager: Stop timeout, forcing cleanup');
        this.isActive = false;
        resolve();
      }, 1000);

      // Listen for the end event
      const originalOnEnd = this.recognition.onend;
      this.recognition.onend = () => {
        clearTimeout(timeout);
        this.isActive = false;
        // Restore original handler
        if (this.recognition) {
          this.recognition.onend = originalOnEnd;
        }
        resolve();
      };

      try {
        console.log('🎤 Voice Recognition Manager: Stopping');
        this.recognition.stop();
      } catch (error) {
        console.warn('🎤 Voice Recognition Manager: Error stopping, trying abort:', error);
        try {
          this.recognition.abort();
        } catch (abortError) {
          console.warn('🎤 Voice Recognition Manager: Error aborting:', abortError);
        }
        clearTimeout(timeout);
        this.isActive = false;
        resolve();
      }
    });
  }

  public isListening(): boolean {
    return this.isActive;
  }

  public isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  public getConfig(): VoiceRecognitionConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<VoiceRecognitionConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.recognition && !this.isActive) {
      this.setupRecognition();
    }
  }

  public async cleanup(): Promise<void> {
    await this.stopListening();
    this.currentCallbacks = {};
  }
}

// Export singleton instance
export const voiceRecognitionManager = VoiceRecognitionManager.getInstance();

// Convenience functions
export const startVoiceRecognition = (
  callbacks: VoiceRecognitionCallbacks = {},
  config: Partial<VoiceRecognitionConfig> = {}
) => voiceRecognitionManager.startListening(callbacks, config);

export const stopVoiceRecognition = () => voiceRecognitionManager.stopListening();

export const isVoiceRecognitionActive = () => voiceRecognitionManager.isListening();

export const isVoiceRecognitionSupported = () => voiceRecognitionManager.isSupported();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    voiceRecognitionManager.cleanup();
  });
}
