// src/hooks/useElevenLabs.ts

import { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

interface ElevenLabsConfig {
  agentId: string;
  apiKey?: string;
}

interface ConversationState {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export const useElevenLabs = (config: ElevenLabsConfig) => {
  const [state, setState] = useState<ConversationState>({
    isConnected: false,
    isConnecting: false,
    isListening: false,
    isSpeaking: false,
    error: null,
  });

  // Usar el hook oficial de ElevenLabs
  const conversation = useConversation({
    onConnect: () => {
      console.log('🟢 Conversation connected');
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false,
        isListening: true,
        error: null
      }));
    },
    onDisconnect: () => {
      console.log('🔴 Conversation disconnected');
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isListening: false,
        isSpeaking: false,
        isConnecting: false
      }));
    },
    onMessage: (message) => {
      console.log('📩 Message received:', message);
      // Aquí puedes manejar mensajes si necesitas
    },
    onError: (error: unknown) => {
      console.error('❌ Conversation error:', error);
      const message = error && typeof error === 'object' && 'message' in error ? String((error as any).message) : 'Conversation error occurred';
      setState(prev => ({ 
        ...prev, 
        error: message,
        isConnected: false,
        isConnecting: false
      }));
    }
  });

  // Sincronizar el estado de isSpeaking del hook con nuestro estado
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isSpeaking: conversation.isSpeaking || false,
      isListening: prev.isConnected && !conversation.isSpeaking
    }));
  }, [conversation.isSpeaking, state.isConnected]);

  // Sincronizar el estado de conexión
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isConnected: conversation.status === 'connected'
    }));
  }, [conversation.status]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Microphone permission granted');
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Microphone access denied. Please allow microphone permissions to use voice conversation.'
      }));
      return false;
    }
  };

  const startConversation = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Solicitar permisos de micrófono primero
      const micPermission = await requestMicrophonePermission();
      if (!micPermission) {
        setState(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      console.log('🎤 Starting conversation with agent:', config.agentId);

      // Iniciar la sesión con el agentId
      const conversationId = await conversation.startSession({
        agentId: config.agentId,
        connectionType: 'websocket',
      });

      console.log('✅ Conversation started with ID:', conversationId);

    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start conversation',
        isConnecting: false 
      }));
    }
  }, [config.agentId, state.isConnecting, state.isConnected, conversation]);

  const stopConversation = useCallback(async () => {
    try {
      console.log('🛑 Stopping conversation...');
      await conversation.endSession();
      
      setState({
        isConnected: false,
        isConnecting: false,
        isListening: false,
        isSpeaking: false,
        error: null,
      });

      console.log('🔴 Conversation stopped');
    } catch (error) {
      console.error('❌ Error stopping conversation:', error);
      // Forzar el reset del estado aunque haya error
      setState({
        isConnected: false,
        isConnecting: false,
        isListening: false,
        isSpeaking: false,
        error: null,
      });
    }
  }, [conversation]);

  const toggleConversation = useCallback(() => {
    if (state.isConnected) {
      stopConversation();
    } else {
      startConversation();
    }
  }, [state.isConnected, startConversation, stopConversation]);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) });
      console.log('🔊 Volume set to:', volume);
    } catch (error) {
      console.error('❌ Error setting volume:', error);
    }
  }, [conversation]);

  return {
    ...state,
    startConversation,
    stopConversation,
    toggleConversation,
    setVolume,
    // Exponer el objeto conversation para funciones adicionales si es necesario
    conversation,
  };
};