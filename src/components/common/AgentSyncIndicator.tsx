"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const WAVE_DURATION = 3; // segundos

// Configuración genérica para cada onda
const wave = {
  initial: { scale: 1, opacity: 0 },          // arranca invisible
  animate: { scale: 6, opacity: [0, 0.5, 0] },// aparece suave y se desvanece
  transition: {
    duration: WAVE_DURATION,
    times: [0, 0.2, 1],                       // 0-20 % de fade-in
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop",
  },
};

export const AgentSyncIndicator = () => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    {/* Etiqueta “LIVE” */}
    <Badge className="absolute top-2 bg-purple-500 text-white text-xxs px-1.5 py-0.5 pointer-events-none">
      LIVE
    </Badge>

    {/* Primera onda */}
    <motion.div
      {...wave}
      className="absolute h-3 w-3 rounded-full border-2 border-purple-500"
    />

    {/* Segunda onda, desfasada medio ciclo para continuidad */}
    <motion.div
      {...wave}
      className="absolute h-3 w-3 rounded-full border-2 border-purple-500"
      transition={{ ...wave.transition, delay: WAVE_DURATION / 2 }}
    />

    {/* Punto central */}
    <div className="h-3 w-3 rounded-full bg-purple-500 shadow-md shadow-purple-500/50" />
  </div>
);
