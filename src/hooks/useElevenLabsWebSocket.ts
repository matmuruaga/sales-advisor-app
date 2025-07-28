// src/hooks/useElevenLabsWebSocket.ts - NO SE ESTÁ USANDO

import { useState, useRef, useCallback, useEffect } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai_client';
  text: string;
  timestamp: Date;
}

interface ElevenLabsWebSocketConfig {
  agentId: string;
}

interface WebSocketState {
  messages: ChatMessage[];
  isConnected: boolean;
  isConnecting: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useElevenLabsWebSocket = (config: ElevenLabsWebSocketConfig) => {
  const [state, setState] = useState<WebSocketState>({
    messages: [],
    isConnected: false,
    isConnecting: false,
    isLoading: false,
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  const connect = useCallback(async () => {
    if (state.isConnecting || state.isConnected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found');
      }

      console.log('🔌 Connecting to ElevenLabs WebSocket...');
      
      // Crear la conexión WebSocket
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${config.agentId}`;
      const ws = new WebSocket(wsUrl);

      // Configurar headers de autenticación después de la conexión
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        
        // Enviar datos de inicialización
        ws.send(JSON.stringify({
          type: "conversation_initiation_client_data",
          conversation_initiation_client_data: {
            custom_llm_extra_body: {},
            conversation_config_override: {}
          }
        }));

        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isConnecting: false,
          error: null
        }));
        
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 WebSocket message received:', data);

          // Manejar diferentes tipos de eventos
          switch (data.type) {
            case 'agent_response':
              if (data.agent_response_event?.agent_response) {
                const aiMessage: ChatMessage = {
                  sender: 'ai_client',
                  text: data.agent_response_event.agent_response,
                  timestamp: new Date(),
                };

                setState(prev => ({
                  ...prev,
                  messages: [...prev.messages, aiMessage],
                  isLoading: false,
                }));
              }
              break;

            case 'agent_response_correction':
              // Corregir la última respuesta del agente
              if (data.agent_response_correction_event?.corrected_agent_response) {
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map((msg, index) => 
                    index === prev.messages.length - 1 && msg.sender === 'ai_client'
                      ? { ...msg, text: data.agent_response_correction_event.corrected_agent_response }
                      : msg
                  ),
                  isLoading: false,
                }));
              }
              break;

            case 'conversation_end':
              console.log('🔚 Conversation ended');
              setState(prev => ({ ...prev, isLoading: false }));
              break;

            case 'ping':
              // Responder al ping para mantener la conexión
              ws.send(JSON.stringify({ type: 'pong' }));
              break;

            case 'user_transcript':
              // Opcional: mostrar la transcripción del usuario si es útil
              console.log('👤 User transcript:', data.user_transcript_event);
              break;

            default:
              console.log('🔄 Other WebSocket event:', data.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection error',
          isConnected: false,
          isConnecting: false,
          isLoading: false
        }));
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          isConnecting: false,
          isLoading: false
        }));

        wsRef.current = null;

        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 2000 * reconnectAttempts.current); // Incrementar delay con cada intento
        }
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to connect',
        isConnecting: false 
      }));
    }
  }, [config.agentId, state.isConnecting, state.isConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      isConnecting: false,
      isLoading: false
    }));

    console.log('🔌 Disconnected from WebSocket');
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!wsRef.current || !state.isConnected || !message.trim()) return;

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
      // Enviar mensaje de texto al agente
      const messageData = {
        type: 'user_text_input',
        user_text_input_event: {
          user_text_input: message.trim()
        }
      };

      wsRef.current.send(JSON.stringify(messageData));
      console.log('📤 Message sent:', message.trim());

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to send message',
        isLoading: false
      }));

      // Agregar mensaje de error
      const errorMessage: ChatMessage = {
        sender: 'ai_client',
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
    }
  }, [state.isConnected]);

  const clearConversation = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      messages: [],
      error: null,
      isLoading: false
    }));
  }, []);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages: state.messages,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isLoading: state.isLoading,
    error: state.error,
    connect,
    disconnect,
    sendMessage,
    clearConversation,
  };
};