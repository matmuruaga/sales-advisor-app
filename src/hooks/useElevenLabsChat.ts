// src/hooks/useElevenLabsChat.ts - IMPLEMENTACIÓN FINAL CON SDK OFICIAL

import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useRef } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai_client';
  text: string;
  timestamp: Date;
}

interface ElevenLabsChatConfig {
  agentId: string;
  participantName: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export const useElevenLabsChat = (config: ElevenLabsChatConfig) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const hasStarted = useRef(false);
  const isProcessingMessage = useRef(false);

  // Hook oficial de ElevenLabs
  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Chat conectado a ElevenLabs');
      setState(prev => ({ 
        ...prev, 
        error: null,
        isLoading: false 
      }));
    },
    
    onDisconnect: () => {
      console.log('🔌 Chat desconectado de ElevenLabs');
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      hasStarted.current = false;
    },
    
    onMessage: (message) => {
      console.log('📥 Mensaje del agente:', message);
      
      // Evitar duplicados si ya estamos procesando
      if (isProcessingMessage.current) return;
      isProcessingMessage.current = true;
      
      // Agregar mensaje del agente
      const aiMessage: ChatMessage = {
        sender: 'ai_client',
        text: message,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));

      // Reset del flag después de un breve delay
      setTimeout(() => {
        isProcessingMessage.current = false;
      }, 100);
    },
    
    onError: (error) => {
      console.error('❌ Error en chat:', error);
      setState(prev => ({ 
        ...prev, 
        error: typeof error === 'string' ? error : error?.message || 'Error de conexión',
        isLoading: false 
      }));
      isProcessingMessage.current = false;
    },
  });

  // Iniciar sesión automáticamente cuando sea necesario
  const ensureConnection = useCallback(async () => {
    if (conversation.status === 'connected' || conversation.status === 'connecting') {
      return;
    }

    if (hasStarted.current) {
      return; // Ya se intentó iniciar
    }

    hasStarted.current = true;

    try {
      console.log('🚀 Iniciando sesión con agente:', config.agentId);
      await conversation.startSession({
        agentId: config.agentId,
      });
    } catch (error) {
      console.error('❌ Error iniciando sesión:', error);
      hasStarted.current = false;
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error iniciando conversación'
      }));
    }
  }, [conversation, config.agentId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Asegurar conexión antes de enviar
    if (conversation.status !== 'connected') {
      await ensureConnection();
      // Esperar un momento para que se conecte
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Verificar que estamos conectados
    if (conversation.status !== 'connected') {
      setState(prev => ({ 
        ...prev, 
        error: 'No conectado. Intenta de nuevo en un momento.' 
      }));
      return;
    }

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
      console.log('📤 Enviando mensaje:', message.trim());
      await conversation.sendUserMessage(message.trim());
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error enviando mensaje',
        isLoading: false
      }));

      // Agregar mensaje de error como respuesta del agente
      const errorMessage: ChatMessage = {
        sender: 'ai_client',
        text: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  }, [conversation, ensureConnection]);

  const clearConversation = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      messages: [],
      error: null,
      isLoading: false
    }));

    // Reiniciar la conversación
    try {
      if (conversation.status === 'connected') {
        await conversation.endSession();
      }
      hasStarted.current = false;
      
      // Esperar un momento antes de reconectar
      setTimeout(() => {
        ensureConnection();
      }, 500);
    } catch (error) {
      console.error('❌ Error limpiando conversación:', error);
      hasStarted.current = false;
    }
  }, [conversation, ensureConnection]);

  const connectManually = useCallback(async () => {
    hasStarted.current = false;
    await ensureConnection();
  }, [ensureConnection]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isConnected: conversation.status === 'connected',
    isConnecting: conversation.status === 'connecting',
    status: conversation.status,
    sendMessage,
    clearConversation,
    connectManually,
    ensureConnection,
  };
};