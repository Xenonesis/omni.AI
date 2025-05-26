/**
 * ⚠️ THIS FILE IS COMMENTED OUT - NOT CURRENTLY USED
 * We are now using the OmniDimension web widget directly instead of API calls
 * Widget script: https://backend.omnidim.io/web_widget.js?secret_key=201ff4fd19c1ffd37b272cc1eacb874a
 */

// Placeholder exports to prevent import errors
export interface VoiceAgentResponse {
  text: string;
  action?: string;
  confidence?: number;
}

export async function callChatBotAPI(message: string, context?: any): Promise<VoiceAgentResponse> {
  throw new Error('This API is disabled. Please use the OmniDimension widget instead.');
}

export async function callVoiceAgentAPI(payload: any): Promise<VoiceAgentResponse> {
  throw new Error('This API is disabled. Please use the OmniDimension widget instead.');
}

/*
// COMMENTED OUT CODE - Original implementation
import { sanitizeSearchQuery, sanitizeApiResponse, voiceRateLimiter } from '../utils/sanitization';
import { handleApiError, ErrorCodes, AppErrorHandler } from '../utils/errorHandling';

export interface VoiceAgentRequest {
  transcript: string;
  timestamp?: string;
  sessionId?: string;
  context?: any;
  // Enhanced agentic fields
  conversationHistory?: Array<{type: 'user' | 'ai', text: string, timestamp: number}>;
  agentMemory?: Array<{query: string, response: string, context: any}>;
  userPreferences?: {
    personality: string;
    voiceEnabled: boolean;
    realTimeMode: boolean;
  };
  apiStatus?: string;
  confidence?: number;
  realTimeMode?: boolean;
  agentState?: string;
}

export interface VoiceAgentResponse {
  text: string;
  action?: string;
  confidence?: number;
  suggestions?: string[];
  followUpQuestions?: string[];
  searchParams?: any;
  navigationTarget?: string;
  shouldSpeak?: boolean;
  // Enhanced agentic response fields
  agentThoughts?: string;
  contextUpdate?: any;
  memoryUpdate?: any;
  nextActions?: string[];
  emotionalTone?: string;
  urgency?: 'low' | 'medium' | 'high';
  requiresFollowUp?: boolean;
}

const OMNIDIMENSION_SECRET_KEY = '201ff4fd19c1ffd37b272cc1eacb874a';
const API_TIMEOUT = 15000; // 15 seconds for OmniDimension API

export async function callVoiceAgentAPI(payload: any) {
  const errorHandler = AppErrorHandler.getInstance();

  // Rate limiting check
  const clientId = payload.sessionId || 'anonymous';
  if (!voiceRateLimiter.isAllowed(clientId)) {
    throw errorHandler.createError(ErrorCodes.RATE_LIMIT_EXCEEDED);
  }

  // Sanitize input payload
  const sanitizedPayload = {
    ...payload,
    transcript: payload.transcript ? sanitizeSearchQuery(payload.transcript) : '',
    message: payload.message ? sanitizeSearchQuery(payload.message) : '',
    timestamp: new Date().toISOString(),
    sessionId: clientId
  };

  console.log('🤖 Calling OmniDimension API with secret key:', OMNIDIMENSION_SECRET_KEY.substring(0, 10) + '...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch('https://backend.omnidim.io/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret-Key': OMNIDIMENSION_SECRET_KEY,
        'X-Client-Version': '1.0.0',
        'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify({
        message: sanitizedPayload.message || sanitizedPayload.transcript,
        session_id: sanitizedPayload.sessionId,
        context: sanitizedPayload.context || {},
        timestamp: sanitizedPayload.timestamp
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('🤖 Voice Agent API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🤖 OmniDimension API Error:', response.status, errorText);
      throw errorHandler.createError(ErrorCodes.API_ERROR, new Error(`OmniDimension API responded with status ${response.status}: ${errorText}`));
    }

    const result = await response.json();
    console.log('🤖 OmniDimension API Success:', result);

    // Transform OmniDimension response to expected format
    return {
      text: result.response || result.message || result.text || 'I received your message.',
      action: result.action || 'chat',
      confidence: result.confidence || 0.9,
      shouldSpeak: true,
      ...result
    };

  } catch (error: any) {
    console.error('🤖 OmniDimension API Error:', error);

    // Handle specific error types
    if (error.name === 'AbortError') {
      throw errorHandler.createError(ErrorCodes.API_TIMEOUT, error);
    }

    if (error.code) {
      // Already handled error
      throw error;
    }

    // For production, we should not use fallback - throw the error
    throw errorHandler.createError(ErrorCodes.API_ERROR, error);
  }
}

// Enhanced function for chat bot integration
export async function callChatBotAPI(message: string, context?: any) {
  console.log('💬 Calling OmniDimension Chat Bot API');

  // Sanitize input message
  const sanitizedMessage = sanitizeSearchQuery(message);

  if (!sanitizedMessage.trim()) {
    const errorHandler = AppErrorHandler.getInstance();
    throw errorHandler.createError(ErrorCodes.INVALID_SEARCH_QUERY);
  }

  const payload = {
    message: sanitizedMessage,
    context: context ? sanitizeApiResponse(context) : {},
    timestamp: new Date().toISOString(),
    sessionId: context?.sessionId || `session_${Date.now()}`,
    type: 'chat'
  };

  return callVoiceAgentAPI(payload);
}
*/