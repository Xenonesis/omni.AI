/**
 * Enhanced Voice Service for Speech Recognition and Text-to-Speech
 * Handles voice input/output with noise reduction and accessibility features
 */

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  noiseReduction: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

export interface SpeechConfig {
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  error?: string;
  confidence: number;
  interimTranscript: string;
  finalTranscript: string;
}

export interface VoiceCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean, confidence: number) => void;
  onEnd?: () => void;
  onError?: (error: string, suggestions?: string[]) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private callbacks: VoiceCallbacks = {};
  private config: VoiceConfig;
  private speechConfig: SpeechConfig;
  private state: VoiceState;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private noiseSuppressionNode: AudioNode | null = null;

  constructor() {
    this.config = {
      language: 'en-IN', // Changed to Indian English for better accent recognition
      continuous: true,
      interimResults: true,
      maxAlternatives: 5, // Increased for better accuracy
      noiseReduction: true,
      echoCancellation: true,
      autoGainControl: true,
    };

    this.speechConfig = {
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8,
      lang: 'en-US',
    };

    this.state = {
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      isSupported: this.checkSupport(),
      confidence: 0,
      interimTranscript: '',
      finalTranscript: '',
    };

    this.initializeServices();
  }

  /**
   * Check browser support for speech APIs
   */
  private checkSupport(): boolean {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    return hasRecognition && hasSynthesis;
  }

  /**
   * Initialize speech recognition and synthesis
   */
  private initializeServices(): void {
    if (!this.state.isSupported) {
      this.state.error = 'Speech APIs not supported in this browser';
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.setupSynthesis();
    }
  }

  /**
   * Setup speech recognition with enhanced features
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.recognition.onstart = () => {
      this.state.isListening = true;
      this.state.error = undefined;
      this.callbacks.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0;

        if (result.isFinal) {
          finalTranscript += transcript;
          this.state.finalTranscript = finalTranscript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
          this.state.interimTranscript = interimTranscript;
        }
      }

      this.state.confidence = maxConfidence;

      // Clean the transcript - remove unwanted punctuation and extra characters
      let cleanTranscript = finalTranscript || interimTranscript;
      if (cleanTranscript) {
        cleanTranscript = this.cleanTranscript(cleanTranscript);
      }

      // Enhanced confidence checking for better accuracy
      if (finalTranscript && maxConfidence < 0.3) {
        console.warn('⚠️ Low confidence speech recognition:', {
          transcript: cleanTranscript,
          confidence: maxConfidence.toFixed(2),
          language: this.config.language
        });
        this.callbacks.onError?.('Low confidence in speech recognition. Please speak clearly and try again.');
        return;
      }

      // Log successful recognition for debugging
      if (finalTranscript) {
        console.log('🎤 Speech recognized:', {
          original: finalTranscript,
          cleaned: cleanTranscript,
          confidence: maxConfidence.toFixed(2),
          language: this.config.language,
          alternatives: this.config.maxAlternatives
        });
      }

      this.callbacks.onResult?.(
        cleanTranscript,
        !!finalTranscript,
        maxConfidence
      );
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.state.error = event.error;
      this.state.isListening = false;

      // Enhanced error handling with specific solutions
      let errorMessage = '';
      let suggestions: string[] = [];

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          suggestions = [
            'Make sure your microphone is working',
            'Speak clearly and loudly',
            'Check if microphone permissions are granted',
            'Try moving closer to the microphone',
            'Reduce background noise'
          ];
          break;

        case 'audio-capture':
          errorMessage = 'Microphone access denied or not available.';
          suggestions = [
            'Grant microphone permissions in browser settings',
            'Check if another app is using the microphone',
            'Try refreshing the page',
            'Ensure microphone is connected properly'
          ];
          break;

        case 'not-allowed':
          errorMessage = 'Microphone permission denied.';
          suggestions = [
            'Click the microphone icon in address bar',
            'Allow microphone access for this site',
            'Check browser privacy settings',
            'Try using HTTPS instead of HTTP'
          ];
          break;

        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          suggestions = [
            'Check your internet connection',
            'Try again in a few moments',
            'Switch to a more stable network'
          ];
          break;

        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          suggestions = [
            'Try starting voice recognition again',
            'Ensure you\'re not switching tabs during recognition'
          ];
          break;

        default:
          errorMessage = `Speech recognition error: ${event.error}`;
          suggestions = [
            'Try refreshing the page',
            'Check microphone permissions',
            'Ensure you\'re using a supported browser'
          ];
      }

      console.error('🎤 Voice Recognition Error:', {
        error: event.error,
        message: errorMessage,
        suggestions,
        timestamp: new Date().toISOString()
      });

      this.callbacks.onError?.(errorMessage, suggestions);
    };

    this.recognition.onend = () => {
      this.state.isListening = false;
      this.callbacks.onEnd?.();
    };
  }

  /**
   * Setup speech synthesis
   */
  private setupSynthesis(): void {
    if (!this.synthesis) return;

    // Wait for voices to load
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.selectBestVoice();
      });
    } else {
      this.selectBestVoice();
    }
  }

  /**
   * Select the best available voice
   */
  private selectBestVoice(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();

    // Prefer neural/premium voices
    let bestVoice = voices.find(voice =>
      voice.lang.startsWith(this.speechConfig.lang) &&
      (voice.name.includes('Neural') || voice.name.includes('Premium'))
    );

    // Fallback to any voice in the correct language
    if (!bestVoice) {
      bestVoice = voices.find(voice => voice.lang.startsWith(this.speechConfig.lang));
    }

    // Final fallback to default voice
    if (!bestVoice) {
      bestVoice = voices[0];
    }

    this.speechConfig.voice = bestVoice;
  }

  /**
   * Start listening with enhanced audio processing
   */
  public async startListening(callbacks?: VoiceCallbacks): Promise<void> {
    if (!this.state.isSupported || !this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.state.isListening) {
      this.stopListening();
    }

    this.callbacks = { ...this.callbacks, ...callbacks };

    try {
      // Request microphone access with noise reduction
      if (this.config.noiseReduction) {
        await this.setupAudioProcessing();
      }

      this.state.interimTranscript = '';
      this.state.finalTranscript = '';
      this.recognition.start();
    } catch (error) {
      this.state.error = `Failed to start listening: ${error}`;
      this.callbacks.onError?.(this.state.error);
    }
  }

  /**
   * Stop listening
   */
  public stopListening(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Speak text with enhanced voice synthesis
   */
  public speak(text: string, options?: Partial<SpeechConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      const config = { ...this.speechConfig, ...options };

      utterance.voice = config.voice || this.speechConfig.voice || null;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;
      utterance.lang = config.lang;

      utterance.onstart = () => {
        this.state.isSpeaking = true;
        this.callbacks.onSpeechStart?.();
      };

      utterance.onend = () => {
        this.state.isSpeaking = false;
        this.currentUtterance = null;
        this.callbacks.onSpeechEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.state.isSpeaking = false;
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  public stopSpeaking(): void {
    if (this.synthesis && this.state.isSpeaking) {
      this.synthesis.cancel();
      this.state.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  /**
   * Setup audio processing for noise reduction
   */
  private async setupAudioProcessing(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseReduction,
          autoGainControl: this.config.autoGainControl,
          sampleRate: 44100,
          channelCount: 1,
        },
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create audio context for additional processing
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Add noise suppression if available
      if (this.audioContext.createScriptProcessor) {
        this.noiseSuppressionNode = this.audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(this.noiseSuppressionNode);
        this.noiseSuppressionNode.connect(this.audioContext.destination);
      }
    } catch (error) {
      console.warn('Advanced audio processing not available:', error);
      // Continue without enhanced audio processing
    }
  }

  /**
   * Get available voices
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || [];
  }

  /**
   * Set voice configuration
   */
  public setVoiceConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
    }
  }

  /**
   * Set speech configuration
   */
  public setSpeechConfig(config: Partial<SpeechConfig>): void {
    this.speechConfig = { ...this.speechConfig, ...config };
  }

  /**
   * Get current voice state
   */
  public getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Check if currently listening
   */
  public isListening(): boolean {
    return this.state.isListening;
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    return this.state.isSpeaking;
  }

  /**
   * Clean transcript by removing unwanted punctuation and extra characters
   */
  private cleanTranscript(transcript: string): string {
    if (!transcript) return '';

    return transcript
      // Remove trailing periods, commas, and other punctuation
      .replace(/[.,!?;:]+$/g, '')
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Convert to lowercase for consistency
      .toLowerCase()
      // Remove any remaining unwanted characters but keep essential ones
      .replace(/[^\w\s\-']/g, '')
      // Clean up any double spaces that might have been created
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check if voice services are supported
   */
  public isSupported(): boolean {
    return this.state.isSupported;
  }

  /**
   * Get last error
   */
  public getLastError(): string | undefined {
    return this.state.error;
  }

  /**
   * Clear error state
   */
  public clearError(): void {
    this.state.error = undefined;
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopListening();
    this.stopSpeaking();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}

export const voiceService = new VoiceService();
