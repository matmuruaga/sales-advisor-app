// src/components/VoiceConversationInterface.tsx - DISEÑO MINIMALISTA

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, X, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
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
    toggleConversation,
    setVolume
  } = useElevenLabs({ agentId });

  const [callDuration, setCallDuration] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(75);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
    if (isSpeaking) return 'AI Speaking';
    if (isListening) return 'Listening';
    return 'Connected';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (isConnecting) return 'text-yellow-500';
    if (!isConnected) return 'text-gray-500';
    if (isSpeaking) return 'text-blue-500';
    if (isListening) return 'text-green-500';
    return 'text-purple-500';
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setCurrentVolume(newVolume);
    if (setVolume) {
      await setVolume(newVolume / 100);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(0,0,0) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg z-20"
        >
          <X className="w-5 h-5 text-gray-700" />
        </Button>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center space-y-8 z-10">
        
        {/* Participant Info */}
        <div className="text-center space-y-3">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
              {participantName.split(' ').map(n => n[0]).join('')}
            </div>
            
            {/* Status Ring */}
            <div className={`absolute inset-0 rounded-full border-4 ${
              isConnected ? 'border-green-400' : 'border-gray-300'
            } transition-colors duration-500`} />
            
            {/* Connection Pulse */}
            {isConnected && (
              <div className="absolute inset-0">
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-green-400"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ 
                      scale: [1, 1.2, 1.4],
                      opacity: [0.6, 0.3, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.8,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{participantName}</h1>
            <p className="text-sm text-gray-600">{scenario} • {difficulty}</p>
          </div>
        </div>

        {/* Status Display */}
        <div className="text-center space-y-2">
          <div className={`text-lg font-medium ${getStatusColor()} transition-colors duration-300`}>
            {getStatusText()}
          </div>
          
          {isConnected && (
            <div className="text-sm text-gray-600 font-mono">
              {formatDuration(callDuration)}
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-full max-w-md">
              {error}
            </div>
          )}
        </div>

        {/* Audio Visualizer */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-1"
              >
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1 rounded-full ${
                      isSpeaking ? 'bg-blue-500' : isListening ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    animate={{
                      height: isListening || isSpeaking ? [6, 24, 6] : 6,
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: isListening || isSpeaking ? Infinity : 0,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    style={{ height: 6 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Call Button */}
        <div className="relative">
          <Button
            onClick={toggleConversation}
            disabled={isConnecting}
            className={`
              w-20 h-20 rounded-full text-white font-bold shadow-2xl transform transition-all duration-300
              ${isConnected 
                ? 'bg-red-500 hover:bg-red-600 hover:scale-105' 
                : 'bg-green-500 hover:bg-green-600 hover:scale-105'
              }
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
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
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full px-4 py-2"
            disabled={!isConnected}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full px-4 py-2"
            disabled={!isConnected}
            onClick={() => setShowControls(!showControls)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Controls
          </Button>
        </div>

        {/* Advanced Controls */}
        <AnimatePresence>
          {showControls && isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xs"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Volume: {currentVolume}%
                    </label>
                    <Slider
                      value={[currentVolume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="text-center max-w-md space-y-3">
          <p className="text-gray-600">
            {!isConnected 
              ? "Click the green button to start your AI conversation practice"
              : "You're live with your AI prospect. Speak naturally and practice your pitch!"
            }
          </p>
          
          {isConnected && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-2xl p-4 border border-blue-100"
            >
              <p className="text-sm text-blue-800">
                💡 <strong>Pro tip:</strong> Wait for the AI to finish speaking before responding. 
                Use natural pauses and speak clearly.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};