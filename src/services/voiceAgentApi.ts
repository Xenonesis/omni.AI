import { sanitizeSearchQuery, sanitizeApiResponse, voiceRateLimiter } from '../utils/sanitization';
import { handleApiError, ErrorCodes, AppErrorHandler } from '../utils/errorHandling';

/**
 * Enhanced Voice Agent API Service with Agentic Capabilities
 * Supports real-time voice interaction and intelligent conversation
 */

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

const VOICE_AGENT_API_KEY = import.meta.env.VITE_VOICE_AGENT_API_KEY || 'hW9MprUtUHNXwakl-aXp2Tqy-Dfz0Q3IhMEx2ntqo5E';
const API_TIMEOUT = 10000; // 10 seconds

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

  console.log('🤖 Calling omniverse.AI Voice Agent API with key:', VOICE_AGENT_API_KEY.substring(0, 10) + '...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch('https://api.omnidim.io/voice-agent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VOICE_AGENT_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(sanitizedPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('🤖 Voice Agent API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🤖 Voice Agent API Error:', errorText);
      throw handleApiError({
        response: { status: response.status, statusText: response.statusText },
        message: errorText
      });
    }

    const result = await response.json();
    console.log('🤖 Voice Agent API Success:', result);

    // Sanitize API response
    const sanitizedResult = sanitizeApiResponse(result);
    return sanitizedResult;

  } catch (error: any) {
    console.warn('🤖 omniverse.AI API not available, using fallback response');

    // Handle specific error types
    if (error.name === 'AbortError') {
      throw errorHandler.createError(ErrorCodes.API_TIMEOUT, error);
    }

    if (error.code) {
      // Already handled error
      throw error;
    }

    // Network or other errors - use fallback
    console.error('Voice Agent API Error:', error);
    return generateFallbackResponse(sanitizedPayload);
  }
}

// Enhanced agentic fallback response generator
function generateFallbackResponse(payload: any): VoiceAgentResponse {
  const transcript = sanitizeSearchQuery(payload.transcript || payload.message || '');
  const lowerTranscript = transcript.toLowerCase();
  const personality = payload.userPreferences?.personality || 'helpful';
  const realTimeMode = payload.realTimeMode || false;
  const conversationHistory = payload.conversationHistory || [];

  // Analyze conversation context for more intelligent responses
  const hasGreeted = conversationHistory.some((msg: any) =>
    msg.type === 'ai' && (msg.text.includes('Hello') || msg.text.includes('Hi'))
  );

  // Personality-based response variations
  const getPersonalityResponse = (baseText: string) => {
    switch (personality) {
      case 'friendly':
        return baseText.replace(/I can/, "I'd love to").replace(/How can I/, "How can I best");
      case 'professional':
        return baseText.replace(/Great!/, "Excellent.").replace(/I can/, "I am able to");
      case 'casual':
        return baseText.replace(/I can/, "I can totally").replace(/!/, "! 😊");
      default:
        return baseText;
    }
  };

  // Enhanced intent detection with context awareness
  if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
    const greeting = hasGreeted
      ? "Welcome back! What else can I help you find today?"
      : "Hello! I'm your omniverse.AI assistant. I'm here to help you discover amazing products with real-time voice interaction.";

    return {
      text: getPersonalityResponse(greeting),
      action: 'help',
      confidence: 0.9,
      shouldSpeak: true,
      agentThoughts: "User is greeting me. Setting up helpful conversation tone.",
      emotionalTone: 'welcoming',
      urgency: 'low',
      followUpQuestions: ['What products are you looking for?', 'Any specific category in mind?'],
      requiresFollowUp: false
    };
  }

  if (lowerTranscript.includes('shoe') || lowerTranscript.includes('nike') || lowerTranscript.includes('adidas')) {
    return {
      text: getPersonalityResponse("I found some amazing shoe options for you! I can help you explore our footwear collection with real-time search. Would you like to see Nike, Adidas, or other brands?"),
      action: 'search',
      confidence: 0.8,
      shouldSpeak: true,
      suggestions: ['Nike shoes', 'Adidas sneakers', 'Running shoes', 'Casual footwear'],
      agentThoughts: "User is interested in footwear. Providing brand options and search suggestions.",
      emotionalTone: 'enthusiastic',
      urgency: 'medium',
      searchParams: { category: 'footwear', query: transcript },
      followUpQuestions: ['What size are you looking for?', 'Any specific color preference?'],
      requiresFollowUp: true
    };
  }

  if (lowerTranscript.includes('phone') || lowerTranscript.includes('smartphone') || lowerTranscript.includes('iphone')) {
    return {
      text: getPersonalityResponse("I can help you find the perfect smartphone! I have real-time access to iPhone, Samsung, and other popular brands. What's your budget range?"),
      action: 'search',
      confidence: 0.8,
      shouldSpeak: true,
      suggestions: ['iPhone deals', 'Samsung phones', 'Budget smartphones', 'Latest models'],
      agentThoughts: "User wants a smartphone. Need to understand budget and preferences.",
      emotionalTone: 'helpful',
      urgency: 'medium',
      searchParams: { category: 'electronics', subcategory: 'smartphones', query: transcript },
      followUpQuestions: ['What features are most important to you?', 'Do you prefer iOS or Android?'],
      requiresFollowUp: true
    };
  }

  if (lowerTranscript.includes('deal') || lowerTranscript.includes('offer') || lowerTranscript.includes('discount')) {
    return {
      text: getPersonalityResponse("Excellent! I can show you today's best deals with real-time pricing. We have special offers on electronics, fashion, and beauty products. Which category interests you most?"),
      action: 'search',
      confidence: 0.8,
      shouldSpeak: true,
      suggestions: ['Electronics deals', 'Fashion offers', 'Beauty discounts', 'All categories'],
      agentThoughts: "User is price-conscious and looking for deals. Show best offers.",
      emotionalTone: 'excited',
      urgency: 'high',
      searchParams: { filter: 'deals', sortBy: 'discount' },
      followUpQuestions: ['Any specific price range in mind?', 'Looking for anything particular?'],
      requiresFollowUp: true
    };
  }

  // Enhanced default response with context awareness
  const contextualResponse = realTimeMode
    ? `I'm processing "${transcript}" in real-time. Let me help you find exactly what you're looking for in our marketplace.`
    : `I understand you're looking for "${transcript}". I can help you explore our marketplace with intelligent search.`;

  return {
    text: getPersonalityResponse(contextualResponse + " What specific products are you interested in?"),
    action: 'search',
    confidence: 0.7,
    shouldSpeak: true,
    suggestions: ['Electronics', 'Fashion', 'Beauty', 'Home & Garden'],
    agentThoughts: `User query: "${transcript}". Providing general assistance and category options.`,
    emotionalTone: 'helpful',
    urgency: 'low',
    searchParams: { query: transcript },
    followUpQuestions: ['Can you be more specific?', 'What category interests you?'],
    requiresFollowUp: true
  };
}

// Enhanced function for chat bot integration
export async function callChatBotAPI(message: string, context?: any) {
  console.log('💬 Calling omniverse.AI Chat Bot API');

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