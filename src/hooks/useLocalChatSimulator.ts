// src/hooks/useLocalChatSimulator.ts - NO SE ESTÁ USANDO

import { useState, useCallback } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai_client';
  text: string;
  timestamp: Date;
}

interface LocalChatConfig {
  participantName: string;
  scenario?: string;
  difficulty?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

// Base de respuestas inteligentes organizadas por contexto
const RESPONSE_PATTERNS = {
  // Respuestas iniciales/introducción
  greeting: [
    "Hi! Thanks for reaching out. I'm always interested in hearing about new solutions, though I have to say I'm quite selective about what we implement here.",
    "Hello! I appreciate you taking the time to connect. Before we dive in, I'd like to understand exactly what problem you're solving.",
    "Hi there! I'm intrigued by your outreach. We're always evaluating new tools, but I need to understand the specific value proposition for our team.",
  ],
  
  // Respuestas sobre el producto/demostración
  product_inquiry: [
    "That sounds interesting, but how does this specifically address our current workflow challenges?",
    "I can see the potential, but I'm concerned about the learning curve for our team. How long does implementation typically take?",
    "The features look good on paper, but I need to understand the real-world performance. Do you have case studies from similar companies?",
    "This could be useful, but I'm wondering about integration complexity. How does this work with our existing tech stack?",
  ],
  
  // Objeciones sobre precio
  pricing: [
    "The price point is definitely higher than what we budgeted for this quarter. Is there any flexibility on pricing?",
    "That's quite an investment. I need to see a clear ROI calculation before I can justify this to the finance team.",
    "The cost is a concern. What's included in that price, and are there any hidden fees we should know about?",
    "I understand the value, but that's stretching our budget. Do you have different pricing tiers or a pilot program?",
  ],
  
  // Preguntas sobre implementación
  implementation: [
    "Implementation is always my biggest concern. What's the typical timeline, and what resources do we need from our side?",
    "I need to understand the onboarding process. How much training will our team need, and what's the support structure?",
    "Change management is crucial for us. How do you ensure user adoption, and what happens if the team resists the new tool?",
    "The technical integration worries me. What if we run into compatibility issues with our current systems?",
  ],
  
  // Comparación con competidores
  competition: [
    "We're also looking at [competitor]. What makes your solution different from what they're offering?",
    "I've heard good things about [other solution]. How do you compare in terms of features and reliability?",
    "The market is quite saturated with similar tools. What's your unique selling proposition?",
    "We've had bad experiences with previous vendors. What guarantees do you offer that this won't be another disappointment?",
  ],
  
  // Próximos pasos
  next_steps: [
    "This has been helpful, but I need to discuss this with my team before moving forward. What's the best way to continue this conversation?",
    "I'm interested, but I need to see this in action. Can we schedule a demo with my technical team present?",
    "Let me think about this and get back to you. What's your timeline, and when do you need a decision?",
    "I'd like to move forward with a pilot. What would that look like, and what's the commitment level?",
  ],
  
  // Respuestas de seguimiento/profundización
  follow_up: [
    "That's a good point. Can you elaborate on how this would specifically impact our daily operations?",
    "I appreciate the explanation. What I'm really trying to understand is the measurable benefit for our bottom line.",
    "Interesting. But I'm still not clear on how this solves our biggest pain point, which is [specific issue].",
    "I hear what you're saying, but I need more concrete examples. Do you have references I can speak with?",
  ]
};

// Palabras clave para detectar el contexto de la conversación
const CONTEXT_KEYWORDS = {
  greeting: ['hello', 'hi', 'thanks for', 'appreciate', 'reaching out', 'connect'],
  product_inquiry: ['feature', 'how does', 'what does', 'show me', 'demo', 'capabilities'],
  pricing: ['cost', 'price', 'budget', 'expensive', 'roi', 'investment', 'fee'],
  implementation: ['implement', 'setup', 'onboard', 'training', 'timeline', 'install'],
  competition: ['competitor', 'alternative', 'vs', 'compare', 'different', 'better'],
  next_steps: ['next', 'follow up', 'schedule', 'demo', 'pilot', 'trial'],
};

export const useLocalChatSimulator = (config: LocalChatConfig) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  // Analizar el contexto del mensaje del usuario
  const analyzeContext = (message: string): keyof typeof RESPONSE_PATTERNS => {
    const lowerMessage = message.toLowerCase();
    
    // Si es el primer mensaje, usar greeting
    if (state.messages.length === 0) {
      return 'greeting';
    }
    
    // Buscar palabras clave para determinar el contexto
    for (const [context, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return context as keyof typeof RESPONSE_PATTERNS;
      }
    }
    
    // Contexto por defecto basado en la posición en la conversación
    const messageCount = state.messages.length;
    if (messageCount <= 2) return 'product_inquiry';
    if (messageCount <= 4) return 'implementation';
    if (messageCount <= 6) return 'pricing';
    return 'follow_up';
  };

  // Generar una respuesta contextual
  const generateResponse = (context: keyof typeof RESPONSE_PATTERNS): string => {
    const responses = RESPONSE_PATTERNS[context];
    const randomIndex = Math.floor(Math.random() * responses.length);
    let response = responses[randomIndex];
    
    // Personalizar la respuesta con el nombre del participante y escenario
    response = response.replace('[specific issue]', getSpecificIssue());
    response = response.replace('[competitor]', getCompetitorName());
    response = response.replace('[other solution]', getOtherSolution());
    
    return response;
  };

  // Obtener un problema específico basado en el escenario
  const getSpecificIssue = (): string => {
    const issues = {
      'Pricing Objections': 'budget constraints and unclear ROI',
      'Discovery Call': 'inefficient sales processes',
      'Schedule a Demo': 'lack of visibility into team performance',
    };
    return issues[config.scenario as keyof typeof issues] || 'operational inefficiency';
  };

  // Obtener nombres de competidores realistas
  const getCompetitorName = (): string => {
    const competitors = ['Salesforce', 'HubSpot', 'Gong', 'Chorus', 'Outreach'];
    return competitors[Math.floor(Math.random() * competitors.length)];
  };

  // Obtener otras soluciones
  const getOtherSolution = (): string => {
    const solutions = ['the market leader', 'a more established solution', 'a cheaper alternative'];
    return solutions[Math.floor(Math.random() * solutions.length)];
  };

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

    // Simular tiempo de respuesta realista
    const responseTime = Math.random() * 2000 + 1000; // 1-3 segundos

    setTimeout(() => {
      try {
        const context = analyzeContext(message);
        const responseText = generateResponse(context);

        const aiMessage: ChatMessage = {
          sender: 'ai_client',
          text: responseText,
          timestamp: new Date(),
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          isLoading: false,
        }));

      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to generate response',
          isLoading: false,
        }));
      }
    }, responseTime);

  }, [state.messages.length, config.scenario]);

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