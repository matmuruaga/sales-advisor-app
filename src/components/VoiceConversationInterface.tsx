// src/components/VoiceConversationInterface.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from './ui/button';
import { useElevenLabs } from '@/hooks/useElevenLabs';

interface VoiceConversationInterfaceProps {
  participantName: string;
  agentId: string;
  scenario?: string;
  difficulty?: string;
  onClose?: () => void;
}

export const VoiceConversationInterface = ({
  participantName,
  agentId,
  scenario,
  difficulty,
  onClose
}: VoiceConversationInterfaceProps) => {
  const {
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    error,
    toggleConversation
  } = useElevenLabs({ agentId });

  const [callDuration, setCallDuration] = useState(0);

  // Timer para duración de llamada
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isConnecting) return 'Connecting...';
    if (!isConnected) return 'Ready to Call';
    if (isSpeaking) return 'AI Speaking...';
    if (isListening) return 'Listening...';
    return 'Connected';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (isConnecting) return 'text-yellow-600';
    if (!isConnected) return 'text-gray-600';
    if (isSpeaking) return 'text-blue-600';
    if (isListening) return 'text-green-600';
    return 'text-purple-600';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      
      {/* Header con información del participante */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto"
        >
          {participantName.split(' ').map(n => n[0]).join('')}
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{participantName}</h2>
        <p className="text-sm text-gray-600">
          AI Voice Simulation • {scenario || 'Practice'} • {difficulty || 'Intermediate'}
        </p>
      </div>

      {/* Indicador de estado */}
      <div className="text-center mb-6">
        <div className={`text-lg font-medium ${getStatusColor()} mb-2`}>
          {getStatusText()}
        </div>
        
        {isConnected && (
          <div className="text-sm text-gray-600">
            Call Duration: {formatDuration(callDuration)}
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Visualizador de audio */}
      <div className="mb-8">
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              {/* Barras de audio animadas */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full ${
                    isSpeaking ? 'bg-blue-500' : isListening ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  animate={{
                    height: isListening || isSpeaking ? [4, 20, 4] : 4,
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: isListening || isSpeaking ? Infinity : 0,
                    delay: i * 0.1,
                  }}
                  style={{ height: 4 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botón principal de llamada */}
      <div className="relative mb-6">
        <motion.div
          animate={{
            scale: isConnected ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isConnected ? Infinity : 0,
          }}
        >
          <Button
            onClick={toggleConversation}
            disabled={isConnecting}
            size="lg"
            className={`
              w-20 h-20 rounded-full text-white font-bold text-lg
              ${isConnected 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
              }
              transition-all duration-300 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isConnecting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Phone className="w-8 h-8" />
              </motion.div>
            ) : isConnected ? (
              <PhoneOff className="w-8 h-8" />
            ) : (
              <Phone className="w-8 h-8" />
            )}
          </Button>
        </motion.div>

        {/* Ondas de conexión */}
        <AnimatePresence>
          {isConnected && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-green-400"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [0.7, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Controles secundarios */}
      <div className="flex space-x-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="bg-white/70 backdrop-blur-sm"
            disabled={!isConnected}
          >
            {isListening ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
            {isListening ? 'Muted' : 'Unmuted'}
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="bg-white/70 backdrop-blur-sm"
            disabled={!isConnected}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
            Speaker
          </Button>
        </motion.div>
      </div>

      {/* Instrucciones */}
      <div className="text-center max-w-md">
        <p className="text-sm text-gray-600 mb-4">
          {!isConnected 
            ? "Click the phone button to start your AI sales conversation practice"
            : "You're now in a live conversation with your AI prospect. Practice your pitch!"
          }
        </p>
        
        {isConnected && (
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-gray-700">
              💡 <strong>Tip:</strong> Speak naturally and practice handling objections. 
              The AI will respond based on the personality profile you configured.
            </p>
          </div>
        )}
      </div>

      {/* Botón de cerrar */}
      {onClose && (
        <motion.div
          className="absolute top-4 right-4"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-white/70 backdrop-blur-sm hover:bg-white/90"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};