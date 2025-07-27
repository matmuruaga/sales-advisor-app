// src/hooks/useElevenLabs.ts

import { useState, useRef, useCallback } from 'react';

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

  const conversationRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const initializeAudio = async () => {
    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      mediaStreamRef.current = stream;

      // Inicializar AudioContext
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      return true;
    } catch (error) {
      console.error('Error inicializando audio:', error);
      setState(prev => ({ ...prev, error: 'Microphone access denied. Please allow microphone permissions.' }));
      return false;
    }
  };

  const startConversation = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Inicializar audio primero
      const audioInitialized = await initializeAudio();
      if (!audioInitialized) {
        setState(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      // Crear conexión usando la nueva API de ElevenLabs
      const startConversationElevenLabs = async () => {
        try {
          // Usar la API web de ElevenLabs directamente
          const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation?agent_id=${config.agentId}`, {
            method: 'GET',
            headers: {
              'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to start conversation');
          }

          // Simular conexión exitosa
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            isConnecting: false,
            isListening: true 
          }));

          console.log('🎤 Conversación iniciada con ElevenLabs');
          
          // Simular conversación activa
          setTimeout(() => {
            setState(prev => ({ ...prev, isSpeaking: true, isListening: false }));
            
            setTimeout(() => {
              setState(prev => ({ ...prev, isSpeaking: false, isListening: true }));
            }, 3000);
          }, 2000);

        } catch (error) {
          console.error('Error connecting to ElevenLabs:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to connect to ElevenLabs. Please check your API key.',
            isConnected: false,
            isConnecting: false 
          }));
        }
      };

      await startConversationElevenLabs();

    } catch (error) {
      console.error('Error iniciando conversación:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start conversation. Please try again.',
        isConnecting: false 
      }));
    }
  }, [config.agentId, state.isConnecting, state.isConnected]);

  const stopConversation = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      isListening: false,
      isSpeaking: false,
      error: null,
    });

    console.log('🔴 Conversación terminada');
  }, []);

  const toggleConversation = useCallback(() => {
    if (state.isConnected) {
      stopConversation();
    } else {
      startConversation();
    }
  }, [state.isConnected, startConversation, stopConversation]);

  // Simular cambios de estado para demo
  const simulateConversation = useCallback(() => {
    if (!state.isConnected) return;

    const states = [
      { isListening: true, isSpeaking: false },
      { isListening: false, isSpeaking: true },
    ];

    let currentStateIndex = 0;
    const interval = setInterval(() => {
      if (!state.isConnected) {
        clearInterval(interval);
        return;
      }

      const newState = states[currentStateIndex];
      setState(prev => ({ ...prev, ...newState }));
      currentStateIndex = (currentStateIndex + 1) % states.length;
    }, 3000);

    return () => clearInterval(interval);
  }, [state.isConnected]);

  return {
    ...state,
    startConversation,
    stopConversation,
    toggleConversation,
  };
};