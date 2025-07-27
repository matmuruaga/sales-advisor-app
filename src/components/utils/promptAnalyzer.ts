// src/utils/promptAnalyzer.ts - VERSIÓN MEJORADA

interface ExtractedData {
  // Datos comunes
  contactName?: string;
  companyName?: string;
  contactRole?: string;
  meetingTopic?: string;
  urgency?: 'low' | 'medium' | 'high';
  
  // Datos específicos para scheduling
  suggestedDate?: Date;
  suggestedTime?: string;
  meetingDuration?: number;
  meetingType?: 'demo' | 'discovery' | 'follow-up' | 'presentation' | 'negotiation';
  
  // Datos específicos para call script
  callGoal?: 'discovery' | 'demo' | 'pricing' | 'negotiation' | 'follow-up';
  painPoints?: string[];
  competitorMentioned?: string;
  budget?: string;
  timeline?: string;
  
  // Datos específicos para simulation
  targetProfile?: string;
  scenario?: 'discovery' | 'demo' | 'pricing' | 'negotiation';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  personalityTraits?: string[];
  emotionalTemperature?: number; // 0-14 scale
}

export class PromptAnalyzer {
  // Patrones mejorados para contactos con roles
  private static contactWithRolePatterns = [
    /(?:con|with|to)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*),?\s*(?:el|la|the)?\s*(CTO|CEO|CFO|VP|Director|Gerente|Manager)(?:\s+(?:de|of))?\s+([A-Z][a-zA-Z0-9]+)/gi,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*),?\s*(?:el|la|the)?\s*(CTO|CEO|CFO|VP Sales|VP de Ventas|Director|Manager)(?:\s+(?:de|of|en|at))?\s+([A-Z][a-zA-Z0-9]+)/gi,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+de\s+([A-Z][a-zA-Z0-9]+)/gi
  ];

  private static simpleContactPatterns = [
    /(?:con|with|to)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/gi,
    /llamar a\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/gi,
    /script para\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/gi
  ];

  private static companyPatterns = [
    /(?:de|of|at|en)\s+([A-Z][a-zA-Z0-9]+(?:\s+(?:Inc|Corp|Ltd|S\.A|SL|AI|Tech|Solutions|Corp))?)/gi,
    /empresa\s+([A-Z][a-zA-Z0-9\s]+)/gi,
    /company\s+([A-Z][a-zA-Z0-9\s]+)/gi
  ];

  private static rolePatterns = [
    /(CTO|CEO|CFO|VP Sales|VP de Ventas|Director de Innovación|Gerente de Operaciones|Sales Manager|Tech Lead|CISO)/gi
  ];

  // Patrones de tiempo mejorados
  private static timePatterns = [
    { pattern: /mañana(?:\s+a\s+las)?\s+(\d{1,2}(?::\d{2})?(?:am|pm|h)?)/gi, days: 1, extractTime: true },
    { pattern: /tomorrow(?:\s+at)?\s+(\d{1,2}(?::\d{2})?(?:am|pm)?)/gi, days: 1, extractTime: true },
    { pattern: /pasado\s+mañana(?:\s+a\s+las)?\s+(\d{1,2}(?::\d{2})?(?:am|pm|h)?)/gi, days: 2, extractTime: true },
    { pattern: /day\s+after\s+tomorrow(?:\s+at)?\s+(\d{1,2}(?::\d{2})?(?:am|pm)?)/gi, days: 2, extractTime: true },
    { pattern: /próxima\s+semana(?:\s+a\s+las)?\s+(\d{1,2}(?::\d{2})?(?:am|pm|h)?)/gi, days: 7, extractTime: true },
    { pattern: /next\s+week(?:\s+at)?\s+(\d{1,2}(?::\d{2})?(?:am|pm)?)/gi, days: 7, extractTime: true },
    { pattern: /en\s+(\d+)\s+días?(?:\s+a\s+las)?\s+(\d{1,2}(?::\d{2})?(?:am|pm|h)?)/gi, days: 'dynamic', extractTime: true },
    { pattern: /in\s+(\d+)\s+days?(?:\s+at)?\s+(\d{1,2}(?::\d{2})?(?:am|pm)?)/gi, days: 'dynamic', extractTime: true },
    { pattern: /mañana/gi, days: 1, extractTime: false },
    { pattern: /tomorrow/gi, days: 1, extractTime: false },
    { pattern: /pasado\s+mañana/gi, days: 2, extractTime: false },
    { pattern: /próxima\s+semana/gi, days: 7, extractTime: false },
    { pattern: /next\s+week/gi, days: 7, extractTime: false }
  ];

  private static hourPatterns = [
    /(?:a\s+las|at)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|h)?/gi,
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm|h)/gi,
    /(\d{1,2}):(\d{2})/g
  ];

  // Patrones mejorados para pain points
  private static painPointPatterns = [
    /(?:problemas?\s+con|problem[s]?\s+with|dificultad(?:es)?\s+(?:con|para)|difficulty\s+with|issues?\s+with|challenges?\s+with)\s+([^,.!?]+)/gi,
    /(?:bajas?\s+tasas?\s+de|low\s+rates?\s+of|poor)\s+([^,.!?]+)/gi,
    /(?:altos?\s+costos?\s+de|high\s+costs?\s+of|expensive)\s+([^,.!?]+)/gi,
    /(?:tiempo\s+de|time\s+(?:spent\s+)?(?:on|for))\s+([^,.!?]+)/gi,
    /(?:rotación\s+(?:alta\s+)?de|high\s+turnover\s+of|churn\s+of)\s+([^,.!?]+)/gi,
    /(?:eficiencia|efficiency|productividad|productivity)\s+(?:de|of|en|in)?\s+([^,.!?]+)/gi
  ];

  // Patrones de presupuesto mejorados
  private static budgetPatterns = [
    /(?:presupuesto\s+(?:de\s+|aproximado\s+)?|budget\s+(?:of\s+|approximately\s+)?)([$€£¥]\d+[KMB]?)/gi,
    /([$€£¥]\d+[KMB]?)\s*(?:anuales?|annually|per\s+year|yearly)/gi,
    /(?:aproximadamente|approximately|around|about)\s+([$€£¥]\d+[KMB]?)/gi,
    /([$€£¥]\d+[KMB]?)/g
  ];

  // Patrones para competidores específicos
  private static competitorPatterns = [
    /(?:vs|versus|comparar\s+con|compare\s+with|evaluando\s+vs|evaluating\s+vs)\s+(Microsoft\s+Sales\s+Copilot|Salesforce\s+Einstein|Gong|Chorus|HubSpot|Outreach)/gi,
    /(Microsoft\s+Sales\s+Copilot|Salesforce\s+Einstein|Microsoft|Salesforce|Gong|Chorus|HubSpot|Outreach)/gi
  ];

  private static personalityIndicators = {
    'data_driven': ['analítico', 'analytical', 'datos', 'data', 'métricas', 'metrics', 'ROI', 'números', 'evidencia'],
    'budget_conscious': ['CFO', 'presupuesto', 'budget', 'costo', 'cost', 'precio', 'price', 'económico', 'affordable', 'justificar'],
    'skeptical': ['escéptico', 'skeptical', 'dudoso', 'doubtful', 'reacio', 'resistant', 'confrontacional', 'confrontational'],
    'innovative': ['innovador', 'innovative', 'tecnología', 'technology', 'disruptivo', 'disruptive', 'IA', 'AI'],
    'relational': ['colaborativo', 'collaborative', 'relación', 'relationship', 'personal', 'confianza', 'trust', 'entusiasta', 'enthusiastic']
  };

  private static difficultyIndicators = {
    'beginner': ['receptivo', 'receptive', 'entusiasta', 'enthusiastic', 'amigable', 'friendly', 'colaborativo', 'collaborative'],
    'intermediate': ['profesional', 'professional', 'ocupado', 'busy', 'directo', 'direct', 'analítico', 'analytical'],
    'advanced': ['escéptico', 'skeptical', 'agresivo', 'aggressive', 'confrontacional', 'confrontational', 'exigente', 'demanding', 'Fortune 500', 'enterprise']
  };

  static analyzePrompt(prompt: string, actionType: string): ExtractedData {
    console.log('🔍 Analizando prompt:', prompt);
    const result: ExtractedData = {};

    // Extraer información de contacto con roles
    const contactInfo = this.extractContactWithRole(prompt);
    if (contactInfo) {
      result.contactName = contactInfo.name;
      result.companyName = contactInfo.company;
      result.contactRole = contactInfo.role;
    }

    // Si no encontramos con rol, intentar patrones simples
    if (!result.contactName) {
      result.contactName = this.extractSimpleContact(prompt);
    }
    
    if (!result.companyName) {
      result.companyName = this.extractCompany(prompt);
    }

    if (!result.contactRole) {
      result.contactRole = this.extractRole(prompt);
    }
    
    // Extraer tema/tópico
    result.meetingTopic = this.extractTopic(prompt);
    
    // Determinar urgencia
    result.urgency = this.determineUrgency(prompt.toLowerCase());

    // Extraer pain points
    result.painPoints = this.extractPainPoints(prompt);

    // Extraer presupuesto
    result.budget = this.extractBudget(prompt);

    // Extraer competidor
    result.competitorMentioned = this.extractCompetitor(prompt);

    // Análisis específico por tipo de acción
    switch (actionType) {
      case 'schedule':
        Object.assign(result, this.analyzeSchedulingPrompt(prompt));
        break;
      case 'call':
        Object.assign(result, this.analyzeCallScriptPrompt(prompt));
        break;
      case 'simulate':
        Object.assign(result, this.analyzeSimulationPrompt(prompt));
        break;
    }

    console.log('✅ Resultado del análisis:', result);
    return result;
  }

  private static extractContactWithRole(prompt: string): {name: string, company: string, role: string} | null {
    for (const pattern of this.contactWithRolePatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0; // Reset regex
        return {
          name: match[1]?.trim(),
          role: match[2]?.trim(),
          company: match[3]?.trim()
        };
      }
    }
    return null;
  }

  private static extractSimpleContact(prompt: string): string | undefined {
    for (const pattern of this.simpleContactPatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0; // Reset regex
        const name = match[1]?.trim();
        if (name && name.length > 2 && name.length < 50) {
          return name;
        }
      }
    }
    return undefined;
  }

  private static extractCompany(prompt: string): string | undefined {
    for (const pattern of this.companyPatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0; // Reset regex
        const company = match[1]?.trim();
        if (company && company.length > 2 && company.length < 50) {
          return company;
        }
      }
    }
    return undefined;
  }

  private static extractRole(prompt: string): string | undefined {
    const match = prompt.match(this.rolePatterns[0]);
    return match ? match[1] : undefined;
  }

  private static extractTopic(prompt: string): string | undefined {
    const topicPatterns = [
      /(?:para|for|sobre|about|regarding)\s+([^,.!?]{10,100})/gi,
      /(?:discutir|discuss|hablar\s+de|talk\s+about)\s+([^,.!?]{10,100})/gi,
      /(?:demo\s+de|demo\s+of|demostración\s+de|demonstration\s+of)\s+([^,.!?]{5,50})/gi
    ];

    for (const pattern of topicPatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0;
        const topic = match[1]?.trim();
        if (topic && topic.length > 3) {
          return topic.substring(0, 100);
        }
      }
    }
    return undefined;
  }

  private static determineUrgency(prompt: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgente', 'urgent', 'asap', 'ya', 'now', 'inmediatamente', 'immediately'];
    const mediumWords = ['pronto', 'soon', 'esta semana', 'this week', 'mañana', 'tomorrow'];
    
    if (urgentWords.some(word => prompt.includes(word))) return 'high';
    if (mediumWords.some(word => prompt.includes(word))) return 'medium';
    return 'low';
  }

  private static extractPainPoints(prompt: string): string[] {
    const painPoints: string[] = [];
    
    for (const pattern of this.painPointPatterns) {
      let match;
      while ((match = pattern.exec(prompt)) !== null) {
        const painPoint = match[1]?.trim();
        if (painPoint && painPoint.length > 3 && painPoint.length < 100) {
          painPoints.push(painPoint);
        }
      }
      pattern.lastIndex = 0; // Reset regex
    }
    
    return [...new Set(painPoints)]; // Remove duplicates
  }

  private static extractBudget(prompt: string): string | undefined {
    for (const pattern of this.budgetPatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0;
        return match[1] || match[0];
      }
    }
    return undefined;
  }

  private static extractCompetitor(prompt: string): string | undefined {
    for (const pattern of this.competitorPatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0;
        return match[1] || match[0];
      }
    }
    return undefined;
  }

  private static analyzeSchedulingPrompt(prompt: string): Partial<ExtractedData> {
    const result: Partial<ExtractedData> = {};
    
    // Extraer fecha y hora juntos
    const dateTimeInfo = this.extractDateAndTime(prompt);
    if (dateTimeInfo.date) result.suggestedDate = dateTimeInfo.date;
    if (dateTimeInfo.time) result.suggestedTime = dateTimeInfo.time;
    
    // Determinar tipo de reunión
    result.meetingType = this.determineMeetingType(prompt);
    
    // Extraer duración
    result.meetingDuration = this.extractDuration(prompt);
    
    return result;
  }

  private static extractDateAndTime(prompt: string): {date?: Date, time?: string} {
    for (const timePattern of this.timePatterns) {
      const match = prompt.match(timePattern.pattern);
      if (match) {
        const days = timePattern.days === 'dynamic' ? parseInt(match[1]) : timePattern.days;
        const date = new Date();
        date.setDate(date.getDate() + days);
        
        let time: string | undefined;
        if (timePattern.extractTime && match.length > 1) {
          const timeMatch = match[timePattern.days === 'dynamic' ? 2 : 1];
          if (timeMatch) {
            time = this.normalizeTime(timeMatch);
          }
        }
        
        return { date, time };
      }
    }
    
    // Si no encontramos fecha con hora, buscar hora separadamente
    const timeOnly = this.extractTimeOnly(prompt);
    return { time: timeOnly };
  }

  private static extractTimeOnly(prompt: string): string | undefined {
    for (const pattern of this.hourPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        return this.normalizeTime(match[0]);
      }
    }
    return undefined;
  }

  private static normalizeTime(timeStr: string): string {
    // Convertir diferentes formatos de hora a HH:MM
    const cleanTime = timeStr.replace(/[^\d:amp]/gi, '');
    
    if (cleanTime.includes(':')) {
      const [hour, minute] = cleanTime.split(':');
      let h = parseInt(hour);
      const m = parseInt(minute) || 0;
      
      if (timeStr.toLowerCase().includes('pm') && h !== 12) h += 12;
      if (timeStr.toLowerCase().includes('am') && h === 12) h = 0;
      
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } else {
      let h = parseInt(cleanTime);
      if (timeStr.toLowerCase().includes('pm') && h !== 12) h += 12;
      if (timeStr.toLowerCase().includes('am') && h === 12) h = 0;
      
      return `${h.toString().padStart(2, '0')}:00`;
    }
  }

  private static determineMeetingType(prompt: string): 'demo' | 'discovery' | 'follow-up' | 'presentation' | 'negotiation' | undefined {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('demo') || lowerPrompt.includes('demostración')) return 'demo';
    if (lowerPrompt.includes('presentación') || lowerPrompt.includes('presentation')) return 'presentation';
    if (lowerPrompt.includes('discovery') || lowerPrompt.includes('descubrimiento') || lowerPrompt.includes('conocer')) return 'discovery';
    if (lowerPrompt.includes('follow-up') || lowerPrompt.includes('seguimiento')) return 'follow-up';
    if (lowerPrompt.includes('negociación') || lowerPrompt.includes('negotiation') || lowerPrompt.includes('contrato')) return 'negotiation';
    
    return 'discovery'; // default
  }

  private static extractDuration(prompt: string): number | undefined {
    const durationMatch = prompt.match(/(\d+)\s*(?:minutos|minutes|min|horas|hours|h)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[0].toLowerCase();
      
      if (unit.includes('hora') || unit.includes('hour') || unit.includes('h')) {
        return value * 60;
      }
      return value;
    }
    return undefined;
  }

  private static analyzeCallScriptPrompt(prompt: string): Partial<ExtractedData> {
    const result: Partial<ExtractedData> = {};
    
    // Determinar objetivo de la llamada
    result.callGoal = this.determineCallGoal(prompt);
    
    // Extraer timeline
    result.timeline = this.extractTimeline(prompt);
    
    return result;
  }

  private static determineCallGoal(prompt: string): 'discovery' | 'demo' | 'pricing' | 'negotiation' | 'follow-up' | undefined {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('demo') || lowerPrompt.includes('demostración')) return 'demo';
    if (lowerPrompt.includes('precio') || lowerPrompt.includes('pricing') || lowerPrompt.includes('costo')) return 'pricing';
    if (lowerPrompt.includes('negociar') || lowerPrompt.includes('negotiate') || lowerPrompt.includes('cerrar')) return 'negotiation';
    if (lowerPrompt.includes('seguimiento') || lowerPrompt.includes('follow-up')) return 'follow-up';
    if (lowerPrompt.includes('discovery') || lowerPrompt.includes('descubrir') || lowerPrompt.includes('conocer')) return 'discovery';
    
    return 'discovery'; // default
  }

  private static extractTimeline(prompt: string): string | undefined {
    const timelinePatterns = [
      /(?:timeline\s+(?:de\s+|of\s+)?|en\s+|in\s+|para\s+|for\s+)(\d+)\s+(días|days|semanas|weeks|meses|months|años|years)/gi,
      /(Q[1-4]|trimestre\s+\d+|quarter\s+\d+)/gi
    ];

    for (const pattern of timelinePatterns) {
      const match = pattern.exec(prompt);
      if (match) {
        pattern.lastIndex = 0;
        return match[0];
      }
    }
    return undefined;
  }

  private static analyzeSimulationPrompt(prompt: string): Partial<ExtractedData> {
    const result: Partial<ExtractedData> = {};
    
    // Determinar perfil objetivo
    result.targetProfile = this.determineTargetProfile(prompt);
    
    // Determinar escenario
    result.scenario = this.determineCallGoal(prompt) as any;
    
    // Determinar dificultad
    result.difficulty = this.determineDifficulty(prompt);
    
    // Determinar traits de personalidad
    result.personalityTraits = this.determinePersonalityTraits(prompt);
    
    // Determinar temperatura emocional
    result.emotionalTemperature = this.determineEmotionalTemperature(prompt);
    
    return result;
  }

  private static determineTargetProfile(prompt: string): string | undefined {
    const lowerPrompt = prompt.toLowerCase();
    
    const profiles = [
      { keywords: ['cto', 'director técnico', 'tech lead'], profile: 'CTO Técnico' },
      { keywords: ['ceo', 'director ejecutivo', 'chief executive'], profile: 'CEO Visionario' },
      { keywords: ['cfo', 'director financiero', 'finance'], profile: 'CFO Analítico' },
      { keywords: ['vp sales', 'vp de ventas', 'vicepresidente'], profile: 'VP de Ventas' },
      { keywords: ['manager', 'gerente', 'director de'], profile: 'Manager Operativo' }
    ];

    for (const { keywords, profile } of profiles) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        // Añadir contexto adicional si está disponible
        if (lowerPrompt.includes('fortune 500') || lowerPrompt.includes('enterprise')) {
          return `${profile} Enterprise`;
        }
        if (lowerPrompt.includes('startup') || lowerPrompt.includes('pyme')) {
          return `${profile} Startup`;
        }
        return profile;
      }
    }
    
    return undefined;
  }

  private static determineDifficulty(prompt: string): 'beginner' | 'intermediate' | 'advanced' | undefined {
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [level, indicators] of Object.entries(this.difficultyIndicators)) {
      if (indicators.some(indicator => lowerPrompt.includes(indicator))) {
        return level as 'beginner' | 'intermediate' | 'advanced';
      }
    }
    
    return 'intermediate'; // default
  }

  private static determinePersonalityTraits(prompt: string): string[] {
    const traits: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [trait, indicators] of Object.entries(this.personalityIndicators)) {
      if (indicators.some(indicator => lowerPrompt.includes(indicator))) {
        traits.push(trait);
      }
    }
    
    return traits.length > 0 ? traits : ['data_driven']; // default
  }

  private static determineEmotionalTemperature(prompt: string): number {
    const lowerPrompt = prompt.toLowerCase();
    
    // Indicadores de alta dificultad (temperatura alta = más escéptico)
    const veryHighWords = ['confrontacional', 'confrontational', 'agresivo', 'aggressive', 'hostil', 'hostile'];
    const highTempWords = ['escéptico', 'skeptical', 'difícil', 'difficult', 'exigente', 'demanding', 'reacio', 'resistant'];
    const mediumTempWords = ['analítico', 'analytical', 'ocupado', 'busy', 'directo', 'direct', 'profesional', 'professional'];
    const lowTempWords = ['amigable', 'friendly', 'receptivo', 'receptive', 'entusiasta', 'enthusiastic', 'colaborativo', 'collaborative'];
    
    if (veryHighWords.some(word => lowerPrompt.includes(word))) return 13; // Very hostile
    if (highTempWords.some(word => lowerPrompt.includes(word))) return 10; // Skeptical
    if (mediumTempWords.some(word => lowerPrompt.includes(word))) return 7; // Neutral
    if (lowTempWords.some(word => lowerPrompt.includes(word))) return 3; // Friendly
    
    return 7; // default to neutral
  }
}