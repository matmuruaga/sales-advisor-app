# Integración Claude API + Sistema de Mentions y Variables

## Resumen

Esta integración proporciona un sistema completo de generación de acciones inteligentes usando Claude API de Anthropic, junto con un sistema avanzado de mentions (@) y variables ([]) para mejorar la experiencia del usuario.

## Arquitectura Implementada

### 1. Backend - Claude API Integration

#### Archivos principales:
- `/src/lib/anthropic.ts` - Cliente y utilidades para Anthropic API
- `/src/lib/promptTemplates.ts` - Templates especializados de prompts para ventas
- `/src/app/api/generate-action/route.ts` - Endpoint API para generar acciones

#### Funcionalidades:
- ✅ Cliente Anthropic configurado con rate limiting
- ✅ Templates de prompts especializados en ventas
- ✅ Manejo de errores y validación de respuestas
- ✅ Integración con Supabase para guardar acciones generadas
- ✅ Resolución automática de variables de contexto

### 2. Sistema de Mentions (@)

#### Archivos principales:
- `/src/components/common/MentionDropdown.tsx` - Dropdown de menciones

#### Funcionalidades:
- ✅ Detección automática de '@' en el texto
- ✅ Búsqueda en tiempo real de contactos
- ✅ Navegación con teclado (↑↓ Enter Esc)
- ✅ Inserción formateada: `@[Nombre](id)`
- ✅ Extracción de contexto para enviar a Claude

### 3. Sistema de Variables ([])

#### Archivos principales:
- `/src/components/common/VariablesSuggestions.tsx` - Dropdown de variables

#### Variables disponibles:
- **Tiempo**: `[today]`, `[tomorrow]`, `[next week]`, `[next month]`, `[end of quarter]`
- **Recursos**: `[my calendar]`, `[meeting room]`, `[product demo]`, `[pricing]`, `[proposal template]`
- **Herramientas**: `[roi calculator]`, `[case study]`, `[trial signup]`, `[support]`

#### Funcionalidades:
- ✅ Detección automática de '[' en el texto
- ✅ Sugerencias categorizadas por tipo
- ✅ Resolución automática de valores
- ✅ Preview de valores resueltos

### 4. Smart Action Composer (Modificado)

#### Archivo principal:
- `/src/components/actions/SmartActionComposer.tsx`

#### Nuevas funcionalidades:
- ✅ Integración completa con sistema de mentions
- ✅ Integración completa con sistema de variables
- ✅ Uso del nuevo endpoint de Claude API
- ✅ Badges visuales para mentions y variables activas
- ✅ Texto de ayuda contextual

## Flujo de Uso

### Ejemplo completo:
1. Usuario escribe: `Schedule demo with @María González [tomorrow] to show [product demo]`
2. Sistema detecta:
   - Mention: María González (contact_id: xxx)
   - Variables: tomorrow → 2024-01-22, product demo → https://demo.salesadvisor.app
3. Se envía a Claude API con contexto completo
4. Claude genera acción estructurada considerando el contexto
5. Se guarda en Supabase con metadata de AI

## Configuración Requerida

### Variables de Entorno (.env.local):
```env
ANTHROPIC_API_KEY=tu_clave_anthropic_aqui
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio # Para operaciones del backend
```

### Dependencias NPM:
```json
{
  "@anthropic-ai/sdk": "^0.60.0"
}
```

## API Endpoints

### POST /api/generate-action

#### Request:
```json
{
  "userPrompt": "Schedule demo with @María González [tomorrow] to show [product demo]",
  "userId": "user_123",
  "mentions": [
    {
      "id": "contact_456", 
      "type": "contact",
      "name": "María González",
      "email": "maria@techcorp.com",
      "company": "TechCorp"
    }
  ],
  "contacts": [],
  "templates": ["Demo Meeting", "Follow-up Call"]
}
```

#### Response:
```json
{
  "success": true,
  "action": {
    "id": "action_789",
    "title": "Product Demo with María González",
    "description": "Schedule and conduct product demonstration...",
    "type": "meeting",
    "priority": "high",
    "dueDate": "2024-01-22",
    "contacts": ["contact_456"],
    "metadata": {
      "aiGenerated": true,
      "confidence": 0.92,
      "model": "claude-3-5-sonnet-20241022",
      "promptVersion": "1.0"
    }
  },
  "reasoning": "Generated high-priority meeting action based on contact context and timeline",
  "templateUsed": "Demo Meeting",
  "resolvedVariables": [
    {"key": "tomorrow", "value": "2024-01-22", "type": "date"},
    {"key": "product demo", "value": "https://demo.salesadvisor.app", "type": "link"}
  ]
}
```

## Componentes UI

### MentionDropdown
- **Props**: options, isVisible, selectedIndex, onSelect, onClose, position, query
- **Funcionalidad**: Muestra contactos y usuarios disponibles para mencionar
- **Navegación**: Teclado y mouse

### VariablesSuggestions
- **Props**: options, isVisible, selectedIndex, onSelect, onClose, position, query
- **Funcionalidad**: Muestra variables disponibles categorizadas
- **Categorías**: time, resources, contacts, tools

## Estilos CSS

Agregados al `globals.css`:
- `.mention-highlight` - Highlighting de menciones
- `.variable-highlight` - Highlighting de variables
- `.mention-badge` - Badges para menciones activas
- `.variable-badge` - Badges para variables activas
- Animaciones de dropdown y efectos hover

## Seguridad y Rate Limiting

### Rate Limiting implementado:
- 50 requests por minuto por usuario
- Cleanup automático de contadores antiguos
- Manejo de errores de cuota y rate limiting

### Validaciones de seguridad:
- Validación de API key en servidor
- Sanitización de inputs
- Manejo seguro de IDs de contactos
- No exposición de claves privadas al frontend

## Testing

### Para probar la integración:

1. **Configurar API Key**:
   - Obtener clave de Anthropic Console
   - Agregarla a `.env.local`

2. **Probar Mentions**:
   - Escribir '@' en SmartActionComposer
   - Verificar que aparezca dropdown con contactos
   - Seleccionar un contacto y verificar formato

3. **Probar Variables**:
   - Escribir '[' en SmartActionComposer
   - Verificar que aparezca dropdown con variables
   - Seleccionar una variable y verificar resolución

4. **Probar Generación completa**:
   - Escribir prompt con mentions y variables
   - Enviar y verificar que se genera acción con Claude
   - Verificar que la acción se guarda en Supabase

## Próximos pasos

### Mejoras sugeridas:
- [ ] Highlighting visual de mentions/variables en textarea
- [ ] Sistema de menciones para team members
- [ ] Variables dinámicas desde configuración de usuario
- [ ] Prompt templates personalizables por industria
- [ ] Métricas de efectividad de acciones generadas por AI
- [ ] Integración con calendarios para variables de tiempo reales
- [ ] Cache inteligente de respuestas de Claude para prompts similares

## Notas de Desarrollo

- El sistema está diseñado para ser extensible
- Se puede agregar fácilmente nuevos tipos de mentions y variables
- Los templates de prompts se pueden personalizar por organización
- La integración es backward-compatible con el sistema existente

## Soporte

Para preguntas o problemas:
1. Verificar configuración de variables de entorno
2. Comprobar logs del servidor para errores de API
3. Verificar que Supabase tenga las tablas necesarias
4. Confirmar que Claude API key tiene los permisos correctos