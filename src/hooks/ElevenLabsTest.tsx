// src/components/ElevenLabsTest.tsx - PRUEBA AISLADA DEL SDK

import { useConversation } from '@elevenlabs/react';
import { useState } from 'react';

export function ElevenLabsTest() {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'agent', text: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Conectado a ElevenLabs');
      setMessages(prev => [...prev, { type: 'agent', text: '🟢 Conectado exitosamente' }]);
    },
    onDisconnect: () => {
      console.log('🔌 Desconectado de ElevenLabs');
      setMessages(prev => [...prev, { type: 'agent', text: '🔴 Desconectado' }]);
    },
    onMessage: (message) => {
      console.log('📥 Mensaje recibido:', message);
      setMessages(prev => [...prev, { type: 'agent', text: message }]);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      setMessages(prev => [...prev, { type: 'agent', text: `❌ Error: ${error.message || error}` }]);
    },
  });

  const startConversation = async () => {
    try {
      console.log('🚀 Iniciando conversación...');
      await conversation.startSession({
        agentId: 'agent_6901k15kdqqrfx9s2f8zhby878c6', // Tu Agent ID
      });
    } catch (error) {
      console.error('❌ Error iniciando conversación:', error);
      setMessages(prev => [...prev, { type: 'agent', text: `❌ Error iniciando: ${error}` }]);
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: inputMessage }]);
      
      try {
        console.log('📤 Enviando mensaje:', inputMessage);
        await conversation.sendUserMessage(inputMessage);
        setInputMessage('');
      } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        setMessages(prev => [...prev, { type: 'agent', text: `❌ Error enviando: ${error}` }]);
      }
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '20px auto', 
      padding: '20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      backgroundColor: '#f8fafc'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#1a202c' }}>
        🧪 ElevenLabs SDK Test
      </h2>
      
      {/* Status Info */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#e2e8f0', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Status:</strong> {conversation.status} <br/>
        <strong>Agent ID:</strong> agent_6901k15kdqqrfx9s2f8zhby878c6 <br/>
        <strong>API Key:</strong> {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '✅ Configurada' : '❌ No encontrada'}
      </div>

      {/* Messages Area */}
      <div style={{ 
        height: '400px', 
        overflowY: 'scroll', 
        border: '1px solid #cbd5e0', 
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        {messages.length === 0 && (
          <div style={{ color: '#718096', fontStyle: 'italic' }}>
            No hay mensajes aún. Inicia la conversación para comenzar.
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            marginBottom: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: msg.type === 'user' ? '#e6fffa' : '#f7fafc',
            borderLeft: `4px solid ${msg.type === 'user' ? '#38b2ac' : '#4299e1'}`
          }}>
            <strong style={{ color: msg.type === 'user' ? '#2c7a7b' : '#3182ce' }}>
              {msg.type === 'user' ? '👤 Tú' : '🤖 Agente'}:
            </strong> 
            <span style={{ marginLeft: '8px' }}>{msg.text}</span>
          </div>
        ))}
      </div>
      
      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe tu mensaje de ventas..."
          disabled={conversation.status !== 'connected'}
          style={{ 
            flex: 1,
            padding: '12px',
            border: '1px solid #cbd5e0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <button 
          onClick={sendMessage}
          disabled={conversation.status !== 'connected' || !inputMessage.trim()}
          style={{ 
            padding: '12px 20px',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📤 Enviar
        </button>
      </div>
      
      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {conversation.status === 'disconnected' && (
          <button 
            onClick={startConversation}
            style={{ 
              padding: '12px 20px',
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🚀 Iniciar Chat
          </button>
        )}
        
        {conversation.status === 'connected' && (
          <button 
            onClick={() => conversation.endSession()}
            style={{ 
              padding: '12px 20px',
              backgroundColor: '#f56565',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🛑 Terminar Chat
          </button>
        )}
        
        <button 
          onClick={() => setMessages([])}
          style={{ 
            padding: '12px 20px',
            backgroundColor: '#a0aec0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>

      {/* Debug Info */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          🔍 Debug Info
        </summary>
        <pre style={{ 
          backgroundColor: '#1a202c', 
          color: '#f7fafc', 
          padding: '10px', 
          borderRadius: '8px',
          fontSize: '12px',
          overflow: 'auto',
          marginTop: '10px'
        }}>
          {JSON.stringify({
            status: conversation.status,
            isSpeaking: conversation.isSpeaking,
            messagesCount: messages.length,
            hasApiKey: !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
            agentId: 'agent_6901k15kdqqrfx9s2f8zhby878c6'
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}