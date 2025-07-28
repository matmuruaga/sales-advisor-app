// src/components/VoiceConversationInterface.tsx - DISEÑO MEJORADO

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Settings, X, Speaker } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { useElevenLabs } from '@/hooks/useElevenLabs';
import { Badge } from './ui/badge';

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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isConnected) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
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

  const getStatusInfo = () => {
    if (error) return { text: 'Connection Error', color: 'text-red-500', pulse: false };
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-500', pulse: true };
    if (!isConnected) return { text: 'Ready to Call', color: 'text-gray-500', pulse: false };
    if (isSpeaking) return { text: 'AI Speaking', color: 'text-blue-500', pulse: true };
    if (isListening) return { text: 'Listening...', color: 'text-green-500', pulse: true };
    return { text: 'Connected', color: 'text-purple-500', pulse: false };
  };

  const statusInfo = getStatusInfo();
  const initials = participantName.split(' ').map(n => n[0]).join('');

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setCurrentVolume(newVolume);
    if (setVolume) await setVolume(newVolume / 100);
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 z-20">
          <X className="w-5 h-5 text-gray-600" />
        </Button>
      )}

      <motion.div 
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl ring-1 ring-black/5 p-8 flex flex-col items-center"
      >

        {/* Participant Info */}
        <motion.div layout="position" className="text-center">
          <div className="relative w-28 h-28 mx-auto">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {initials}
            </div>
            <div className={`absolute inset-0 rounded-full border-4 ${isConnected ? 'border-green-400' : 'border-gray-300/50'} transition-all duration-500`}/>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-5">{participantName}</h1>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Badge variant="outline">{scenario}</Badge>
            <Badge variant="secondary">{difficulty}</Badge>
          </div>
        </motion.div>

        {/* Status & Visualizer Panel */}
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="w-full mt-6 text-center"
            >
                <div className="flex items-center justify-center space-x-3 font-mono text-lg">
                    <p className={statusInfo.color}>{statusInfo.text}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-gray-600">{formatDuration(callDuration)}</p>
                </div>
                <div className="h-12 flex items-center justify-center mt-2">
                    <div className="flex items-end space-x-1.5 h-full">
                        {[...Array(7)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-1.5 rounded-full ${isSpeaking ? 'bg-blue-500' : isListening ? 'bg-green-500' : 'bg-gray-300'}`}
                                animate={{ height: isListening || isSpeaking ? ['0%', '100%', '0%'] : '15%' }}
                                transition={{
                                    duration: 0.8,
                                    repeat: isListening || isSpeaking ? Infinity : 0,
                                    delay: i * 0.12,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
        
         {/* Espaciador dinámico */}
        <motion.div
            layout
            animate={{ height: isConnected ? 16 : 96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />


        {/* Controls Section */}
        <motion.div layout className="w-full flex flex-col items-center">
            {/* Call/End Call Button */}
            <Button
                onClick={toggleConversation}
                disabled={isConnecting}
                className={`w-20 h-20 rounded-full text-white shadow-xl transition-all duration-300 transform hover:scale-105 ${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <AnimatePresence mode="wait">
                    {isConnecting ? (
                         <motion.div key="connecting" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Phone className="w-8 h-8" /></motion.div>
                    ) : isConnected ? (
                         <motion.div key="connected" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><PhoneOff className="w-8 h-8" /></motion.div>
                    ) : (
                         <motion.div key="disconnected" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Phone className="w-8 h-8" /></motion.div>
                    )}
                </AnimatePresence>
            </Button>
            
            {/* Secondary Controls */}
            <AnimatePresence>
            {isConnected && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center space-x-4 mt-6"
                >
                    <Button variant="outline" size="lg" className="rounded-full bg-white/50" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-full bg-white/50" onClick={() => setShowControls(c => !c)}>
                        <Settings className="w-5 h-5" />
                    </Button>
                </motion.div>
            )}
            </AnimatePresence>
        </motion.div>

        {/* Advanced Controls Panel */}
        <AnimatePresence>
        {showControls && isConnected && (
            <motion.div
                layout
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '24px' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="w-full max-w-xs overflow-hidden"
            >
                <div className="bg-white/50 p-4 rounded-2xl border">
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
                        <Speaker className="w-4 h-4 mr-2"/>
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
            </motion.div>
        )}
        </AnimatePresence>

        {/* Helper Text & Error Message */}
        <div className="text-center mt-8 h-10">
             {error ? (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>
             ) : (
                <p className="text-sm text-gray-500">
                    {!isConnected 
                        ? "Click the green button to start the call"
                        : "You're live. The AI is listening."}
                </p>
             )}
        </div>
      </motion.div>
    </div>
  );
};