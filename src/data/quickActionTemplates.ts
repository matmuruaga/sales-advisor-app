// src/data/quickActionTemplates.ts

export interface QuickTemplate {
  title: string;
  prompt: string;
  category?: string;
}

export const quickActionTemplates: { [key: string]: QuickTemplate[] } = {
  schedule: [
    {
      title: "Demo Meeting with CTO",
      prompt: "Necesito programar una reunión con María González, la CTO de TechCorp, para mañana a las 2:30pm para hacer una demostración de SixthSense y discutir cómo puede mejorar la eficiencia de su equipo de ventas.",
      category: "demo"
    },
    {
      title: "Follow-up Call - High Priority", 
      prompt: "Programar llamada de seguimiento urgente con Carlos Ruiz de InnovateAI para pasado mañana a las 10:00am. Quieren discutir el presupuesto de $150K y la implementación en 6 semanas.",
      category: "follow-up"
    },
    {
      title: "Discovery Meeting - New Lead",
      prompt: "Agendar reunión de discovery con Ana López, VP de Ventas en DataSolutions, para la próxima semana. Ella mencionó problemas con productividad del equipo y costos operacionales altos.",
      category: "discovery"
    },
    {
      title: "Enterprise Presentation",
      prompt: "Necesito una presentación con el equipo directivo de GlobalTech para próxima semana a las 3pm. Van a evaluar SixthSense vs Microsoft Sales Copilot para su equipo de 200 representantes.",
      category: "presentation"
    },
    {
      title: "Contract Negotiation",
      prompt: "Programar reunión de negociación con Elena Pérez, CEO de StartupABC, para en 3 días a las 4pm. Discutir términos finales del contrato de $80K anuales.",
      category: "negotiation"
    },
    {
      title: "Technical Deep Dive",
      prompt: "Agendar sesión técnica con Roberto Martín, CTO de FinanceCorps, mañana 11:30am. Necesita detalles sobre integración API y cumplimiento GDPR para implementación enterprise.",
      category: "demo"
    }
  ],

  call: [
    {
      title: "Cold Outreach - CTO",
      prompt: "Crear script para llamar a María González, CTO de TechCorp. Tienen problemas con bajas tasas de cierre en su equipo de ventas y están evaluando soluciones de IA. Su presupuesto es aproximadamente $100K anuales.",
      category: "discovery"
    },
    {
      title: "Warm Lead Follow-up",
      prompt: "Generar script para Carlos Ruiz de InnovateAI quien nos contactó por LinkedIn. Quiere entender cómo SixthSense puede reducir el tiempo de preparación de llamadas que actualmente les toma 2 horas diarias.",
      category: "demo"
    },
    {
      title: "Pricing Objection Call",
      prompt: "Script para Ana López de DataSolutions. Está interesada pero preocupada por el costo vs Salesforce Einstein. Su timeline es de 4 meses y presupuesto limitado a $60K.",
      category: "pricing"
    },
    {
      title: "Competitive Displacement",
      prompt: "Llamar a Elena Pérez de StartupABC. Actualmente usan Gong pero no están satisfechos con la falta de coaching en tiempo real. Tienen 25 representantes y necesitan implementar en Q4.",
      category: "negotiation"
    },
    {
      title: "Enterprise Discovery",
      prompt: "Script para Roberto Martín, CTO de FinanceCorps. Empresa Fortune 500 con problemas de escalabilidad en ventas. Mencionar nuestro caso de éxito con BankingCorp que mejoró conversión 40%.",
      category: "discovery"
    },
    {
      title: "Referral Call",
      prompt: "Llamar a Laura Sánchez, VP Sales de TechStartup, referida por nuestro cliente exitoso Miguel Torres. Ella tiene problemas con onboarding de nuevos SDRs y rotación alta del equipo.",
      category: "discovery"
    },
    {
      title: "Renewal Discussion", 
      prompt: "Script para renovación con Patricia Vega de ClientSuccess. Su contrato vence en 2 meses, están contentos pero quieren expandir a 2 equipos adicionales con descuento por volumen.",
      category: "negotiation"
    }
  ],

  simulate: [
    {
      title: "Skeptical CTO - Technical Objections",
      prompt: "Practicar con un CTO muy técnico y escéptico de una empresa Fortune 500. Es analítico, hace preguntas difíciles sobre arquitectura de IA y está comparando con Microsoft Sales Copilot.",
      category: "advanced"
    },
    {
      title: "Budget-Conscious CFO",
      prompt: "Simular conversación con CFO que siempre pregunta por ROI y datos. Es muy directo, preocupado por costos de implementación, y necesita justificar cada gasto ante la junta directiva.",
      category: "advanced"
    },
    {
      title: "Friendly VP Sales - Demo",
      prompt: "Practicar demo con VP de Ventas receptivo y entusiasta. Es colaborativo, hace buenas preguntas, y está emocionado por probar nuevas tecnologías para su equipo.",
      category: "beginner"
    },
    {
      title: "Busy CEO - Quick Pitch",
      prompt: "Simular presentación de 15 minutos con CEO muy ocupado. Es directo, impaciente, quiere ver valor inmediato y toma decisiones rápidas si le convence la propuesta.",
      category: "intermediate"
    },
    {
      title: "Procurement Manager - Negotiation",
      prompt: "Practicar negociación con gerente de compras agresivo. Es confrontacional, busca descuentos máximos, compara con 5 competidores diferentes y es muy exigente con términos.",
      category: "advanced"
    },
    {
      title: "Innovation Director - Early Adopter",
      prompt: "Simular con Director de Innovación entusiasta de IA. Es curioso sobre capacidades emocionales, pregunta por roadmap futuro, y está dispuesto a ser beta tester.",
      category: "intermediate"
    },
    {
      title: "Operations Manager - Process Focus",
      prompt: "Practicar con Gerente de Operaciones analítico. Se enfoca en procesos, eficiencias, métricas de productividad, y necesita evidencia de mejoras operacionales medibles.",
      category: "intermediate"
    }
  ],

  nested: [
    {
      title: "Complex Multi-Stakeholder Meeting",
      prompt: "Analizar reunión con 5 participantes: CEO Juan López (TechCorp), CFO María Torres, CTO Carlos Ruiz, VP Sales Ana Vega, y Procurement Director Luis Martín. Discutir implementación enterprise de $500K.",
      category: "enterprise"
    },
    {
      title: "Board Presentation Analysis",
      prompt: "Examinar presentación a junta directiva de GlobalInc. Participantes incluyen 8 miembros del board, CEO externa consultora, y nuestro equipo. Decidir sobre inversión estratégica en IA.",
      category: "strategic"
    },
    {
      title: "Technical Committee Review",
      prompt: "Analizar sesión con comité técnico: 3 CTOs de diferentes divisiones, Arquitecto Principal, CISO, y Director de Datos. Evaluar arquitectura e integración de SixthSense.",
      category: "technical"
    },
    {
      title: "Vendor Selection Process",
      prompt: "Revisar proceso de selección con panel de evaluación: VP Procurement Sandra Villa, Director IT Roberto Chen, Sales Operations Manager Laura Kim, y Finance Director David Brown.",
      category: "procurement"
    }
  ]
};

// Patrones específicos que el analizador reconoce fácilmente
export const recognitionPatterns = {
  // Nombres de contacto (Nombre Apellido)
  names: [
    "María González", "Carlos Ruiz", "Ana López", "Elena Pérez", 
    "Roberto Martín", "Laura Sánchez", "Patricia Vega", "Juan López",
    "Luis Martín", "Sandra Villa", "Roberto Chen", "Laura Kim", "David Brown"
  ],
  
  // Empresas con diferentes formatos
  companies: [
    "TechCorp", "InnovateAI", "DataSolutions", "StartupABC", 
    "FinanceCorps", "GlobalTech", "ClientSuccess", "TechStartup",
    "BankingCorp", "GlobalInc"
  ],
  
  // Títulos/roles que el sistema reconoce
  roles: [
    "CTO", "CEO", "CFO", "VP de Ventas", "VP Sales", "Director de Innovación",
    "Gerente de Operaciones", "Director IT", "CISO", "Director de Datos"
  ],
  
  // Palabras clave para pain points
  painPointKeywords: [
    "problemas con", "dificultades con", "challenges with", "issues with",
    "bajas tasas de cierre", "tiempo de preparación", "productividad del equipo",
    "costos operacionales", "rotación alta", "onboarding", "escalabilidad"
  ],
  
  // Indicadores de tiempo que funcionan
  timeIndicators: [
    "mañana", "pasado mañana", "próxima semana", "en 3 días", 
    "tomorrow", "next week", "in 2 days", "Q4", "en 6 semanas"
  ],
  
  // Formatos de hora reconocidos
  timeFormats: [
    "2:30pm", "10:00am", "3pm", "11:30am", "14:30", "15:00"
  ],
  
  // Indicadores de presupuesto
  budgetFormats: [
    "$100K", "$150K anuales", "$80K", "presupuesto de $60K", 
    "$500K", "€75K", "100 mil euros"
  ],
  
  // Indicadores de personalidad para simulación
  personalityIndicators: {
    skeptical: ["escéptico", "skeptical", "preguntas difíciles", "analítico"],
    budget_conscious: ["CFO", "costo", "presupuesto", "ROI", "justificar gasto"],
    data_driven: ["datos", "métricas", "analítico", "evidencia", "medibles"],
    innovative: ["innovación", "IA", "nuevas tecnologías", "beta tester"],
    relational: ["colaborativo", "receptivo", "entusiasta", "amigable"]
  },
  
  // Indicadores de dificultad
  difficultyIndicators: {
    beginner: ["receptivo", "entusiasta", "amigable", "colaborativo"],
    intermediate: ["profesional", "ocupado", "directo", "curioso"],
    advanced: ["escéptico", "agresivo", "confrontacional", "exigente", "Fortune 500"]
  }
};

// Función de ayuda para generar prompts optimizados
export const generateOptimizedPrompt = (type: string, params: any) => {
  const templates = quickActionTemplates[type] || [];
  
  switch (type) {
    case 'schedule':
      return `Necesito programar una reunión con ${params.name || 'María González'}, ${params.role || 'CTO'} de ${params.company || 'TechCorp'}, para ${params.when || 'mañana a las 2pm'} para ${params.purpose || 'hacer una demo de SixthSense'}.`;
      
    case 'call':
      return `Crear script para llamar a ${params.name || 'Carlos Ruiz'} de ${params.company || 'InnovateAI'}. Tienen ${params.painPoint || 'problemas con eficiencia de ventas'} y ${params.budget ? `su presupuesto es ${params.budget}` : 'están evaluando soluciones'}.`;
      
    case 'simulate':
      return `Practicar con un ${params.role || 'CTO'} ${params.personality || 'escéptico y analítico'} de una ${params.companyType || 'empresa enterprise'}. ${params.characteristics || 'Hace preguntas difíciles y está comparando con competidores'}.`;
      
    default:
      return templates[0]?.prompt || "Describe lo que necesitas hacer...";
  }
};

// Templates específicos para SixthSense que garantizan reconocimiento
export const sixthSenseOptimizedTemplates = {
  schedule: [
    "Programar demo de SixthSense con María González, CTO de TechCorp, mañana 3pm. Quiere ver cómo mejoramos eficiencia vs Microsoft Sales Copilot.",
    "Reunión urgente con Elena Pérez, CEO de StartupABC, pasado mañana 10am. Discutir implementación de copiloto de IA para equipo de 25 representantes.",
    "Agendar presentación con Carlos Ruiz de InnovateAI próxima semana 2pm. Presupuesto $200K, timeline Q4, actualmente usan Gong pero insatisfechos."
  ],
  
  call: [
    "Script para Ana López, VP Sales de DataCorp. Problemas con onboarding de SDRs y bajas tasas de conversión. Presupuesto $150K, timeline 8 semanas.",
    "Llamar a Roberto Martín, CTO de FinanceAI. Empresa Fortune 500, evalúan vs Salesforce Einstein, necesitan cumplimiento GDPR y integración enterprise.",
    "Contact Patricia Vega de GlobalSales. Renovación de contrato, quieren expandir a 3 equipos adicionales, negociar descuento por volumen."
  ],
  
  simulate: [
    "Practicar con CFO muy analítico y escéptico sobre costos de SixthSense. Pregunta mucho por ROI, datos, y justificación ante junta directiva.",
    "Simular con CTO técnico que duda de capacidades de IA emocional. Es confrontacional, compara con Microsoft, hace preguntas muy específicas.",
    "Entrenar con CEO ocupado e impaciente. Quiere pitch de 10 minutos, toma decisiones rápidas, se enfoca en resultados inmediatos."
  ]
};

export default quickActionTemplates;