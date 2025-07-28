// src/hooks/useElevenLabsTextChat.ts

import { useState, useCallback } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai_client';
  text: string;
  timestamp: Date;
}

interface ElevenLabsTextChatConfig {
  participantName: string;
  scenario?: string;
  difficulty?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// Configuración de personalidades de ventas
const SALES_PERSONALITIES = {
  'Pricing Objections': {
    personality: 'budget-conscious CFO who is skeptical about ROI and needs clear financial justification',
    common_objections: ['too expensive', 'budget constraints', 'unclear ROI', 'need approval'],
    tone: 'analytical and cautious'
  },
  'Discovery Call': {
    personality: 'busy VP Sales who is interested but needs to understand specific value proposition',
    common_objections: ['time constraints', 'current process works', 'need more details'],
    tone: 'direct and results-focused'
  },
  'Schedule a Demo': {
    personality: 'technical decision maker who wants to see proof of concept before committing',
    common_objections: ['need to see it working', 'integration concerns', 'security questions'],
    tone: 'inquisitive and detail-oriented'
  }
};

export const useElevenLabsTextChat = (config: ElevenLabsTextChatConfig) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Generar un prompt contextual para el LLM
  const generateContextualPrompt = (userMessage: string, conversationHistory: ChatMessage[]): string => {
    const personality = SALES_PERSONALITIES[config.scenario as keyof typeof SALES_PERSONALITIES] || SALES_PERSONALITIES['Discovery Call'];
    
    const historyContext = conversationHistory
      .slice(-4) // Solo los últimos 4 mensajes para contexto
      .map(msg => `${msg.sender === 'user' ? 'Salesperson' : config.participantName}: ${msg.text}`)
      .join('\n');

    return `You are ${config.participantName}, a ${personality.personality}. You are in a sales conversation.

SCENARIO: ${config.scenario}
YOUR PERSONALITY: ${personality.tone}
COMMON OBJECTIONS: ${personality.common_objections.join(', ')}

CONVERSATION HISTORY:
${historyContext}

CURRENT MESSAGE FROM SALESPERSON: "${userMessage}"

Respond as ${config.participantName} would respond in this sales context. Be realistic, professional, and stay in character. Keep responses concise (1-2 sentences max). Show appropriate interest or skepticism based on the scenario.

Response:`;
  };

  const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found');
      }

      // Usar OpenAI GPT para generar la respuesta (puedes cambiar esto por tu LLM preferido)
      const prompt = generateContextualPrompt(userMessage, state.messages);

      // Si tienes acceso a OpenAI, puedes usar esto:
      /*
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });
      
      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        return data.choices[0].message.content.trim();
      }
      */

      // Fallback: Usar respuestas contextuales inteligentes
      return generateContextualResponse(userMessage, config);

    } catch (error) {
      console.error('Error generating AI response:', error);
      return generateContextualResponse(userMessage, config);
    }
  }, [state.messages, config]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Agregar mensaje del usuario inmediatamente
    const userMessage: ChatMessage = {
      sender: 'user',
      text: message.trim(),
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Generar respuesta de AI
      const aiResponseText = await generateAIResponse(message.trim());

      // Simular tiempo de respuesta realista
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      const aiMessage: ChatMessage = {
        sender: 'ai_client',
        text: aiResponseText,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('❌ Error in chat:', error);
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send message',
        isLoading: false,
      }));

      // Agregar mensaje de fallback
      const fallbackMessage: ChatMessage = {
        sender: 'ai_client',
        text: generateContextualResponse(message, config),
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, fallbackMessage],
      }));
    }
  }, [generateAIResponse, config]);

  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearConversation,
  };
};

// Función para generar respuestas contextuales inteligentes
function generateContextualResponse(userMessage: string, config: ElevenLabsTextChatConfig): string {
  const lowerMessage = userMessage.toLowerCase();
  const messageCount = 0; // Podrías pasar esto como parámetro

  // Respuestas por escenario
  const responses = {
    'Pricing Objections': {
      greeting: [
        "Hi! I appreciate you reaching out. I have to say, we're pretty careful about our technology investments these days.",
        "Thanks for connecting. We're always looking at new solutions, but our CFO has been quite strict about our budget this quarter."
      ],
      pricing: [
        "That price point is definitely higher than what we had in mind. Is there any flexibility on the cost?",
        "I need to understand the ROI better before I can justify this investment to our finance team.",
        "The cost is a concern. What exactly is included, and are there any hidden fees?"
      ],
      features: [
        "The features sound interesting, but how does this compare to what we're currently using?",
        "I can see the value, but I'm worried about the learning curve for our team."
      ],
      implementation: [
        "Implementation is always my biggest concern. How long does this typically take?",
        "What kind of support do you provide during the rollout phase?"
      ],
      default: [
        "That's interesting, but I need to understand the specific value for our business.",
        "Can you walk me through how this would actually save us money?"
      ]
    },
    'Discovery Call': {
      greeting: [
        "Hi there! I'm interested to hear what you have to offer, though I should mention we're pretty busy this quarter.",
        "Thanks for reaching out. I can give you a few minutes - what's this about?"
      ],
      features: [
        "That sounds useful, but how does this fit into our existing sales process?",
        "What specific problems does this solve that we can't handle with our current tools?"
      ],
      results: [
        "Do you have any case studies from companies similar to ours?",
        "What kind of results are your current customers seeing?"
      ],
      default: [
        "I need more specifics. How exactly would this help our sales team?",
        "What makes this different from the dozen other sales tools we've been pitched?"
      ]
    },
    'Schedule a Demo': {
      greeting: [
        "Hello! I'm always interested in seeing new technology, especially if it can help our team be more efficient.",
        "Hi! I saw your message. A demo could be interesting - what exactly would you be showing us?"
      ],
      demo: [
        "A demo would be helpful. Can we include our technical team in that call?",
        "I'd like to see this in action. What would a typical demo session look like?"
      ],
      technical: [
        "I need to understand the technical requirements and security implications.",
        "How does this integrate with our existing CRM and sales stack?"
      ],
      default: [
        "I'm interested in seeing how this works in practice.",
        "Can you show me some real examples of this in action?"
      ]
    }
  };

  const scenarioResponses = responses[config.scenario as keyof typeof responses] || responses['Discovery Call'];

  // Detectar intención
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || messageCount === 0) {
    return getRandomResponse(scenarioResponses.greeting);
  }
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
    return getRandomResponse(scenarioResponses.pricing || scenarioResponses.default);
  }
  if (lowerMessage.includes('demo') || lowerMessage.includes('show')) {
    return getRandomResponse(scenarioResponses.demo || scenarioResponses.default);
  }
  if (lowerMessage.includes('feature') || lowerMessage.includes('what does')) {
    return getRandomResponse(scenarioResponses.features || scenarioResponses.default);
  }
  if (lowerMessage.includes('implement') || lowerMessage.includes('setup')) {
    return getRandomResponse(scenarioResponses.implementation || scenarioResponses.default);
  }
  if (lowerMessage.includes('technical') || lowerMessage.includes('integration')) {
    return getRandomResponse(scenarioResponses.technical || scenarioResponses.default);
  }
  if (lowerMessage.includes('result') || lowerMessage.includes('case study')) {
    return getRandomResponse(scenarioResponses.results || scenarioResponses.default);
  }

  return getRandomResponse(scenarioResponses.default);
}

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}