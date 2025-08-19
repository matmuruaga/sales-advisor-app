# Feature Flags System Documentation

## Descripción General

El sistema de feature flags permite controlar de manera granular el rollout de Row Level Security (RLS) y otras características críticas del sistema. Está diseñado con seguridad como prioridad y permite rollbacks rápidos en caso de problemas.

## Configuración de Variables de Entorno

### Variables Principales

```bash
# Control global de RLS
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true|false

# Autenticación mock para desarrollo
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=true|false

# Rollout gradual tabla por tabla
NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT=true|false

# Kill switch de emergencia
NEXT_PUBLIC_RLS_KILL_SWITCH=true|false

# Logging de feature flags
NEXT_PUBLIC_FEATURE_FLAG_LOGGING=true|false

# Bypass de autenticación mock
NEXT_PUBLIC_MOCK_AUTH_BYPASS=true|false

# Modo estricto RLS
NEXT_PUBLIC_RLS_STRICT_MODE=true|false

# Modo override (solo desarrollo)
NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=true|false

# Ambiente específico
NEXT_PUBLIC_ENVIRONMENT=development|staging|production
```

### Variables por Tabla

Para cada tabla sin RLS, puedes controlarla individualmente:

```bash
# Tablas críticas
NEXT_PUBLIC_RLS_TABLE_USERS=true|false
NEXT_PUBLIC_RLS_TABLE_USER_SESSIONS=true|false
NEXT_PUBLIC_RLS_TABLE_USER_PERFORMANCE=true|false
NEXT_PUBLIC_RLS_TABLE_AI_MODEL_CONFIGS=true|false
NEXT_PUBLIC_RLS_TABLE_API_RATE_LIMITS=true|false
NEXT_PUBLIC_RLS_TABLE_AUTH_SESSION_MONITORING=true|false
NEXT_PUBLIC_RLS_TABLE_CONTACT_EMBEDDINGS=true|false
NEXT_PUBLIC_RLS_TABLE_REAL_TIME_PRESENCE=true|false
NEXT_PUBLIC_RLS_TABLE_SYSTEM_LOGS=true|false
```

## Configuraciones por Ambiente

### Desarrollo
```bash
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_FEATURE_RLS_ENABLED=false
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=true
NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT=true
NEXT_PUBLIC_RLS_STRICT_MODE=false
NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=true
```

### Staging
```bash
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false
NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT=true
NEXT_PUBLIC_RLS_STRICT_MODE=false
NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=true
```

### Producción
```bash
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_FEATURE_RLS_ENABLED=true
NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false
NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT=true
NEXT_PUBLIC_RLS_STRICT_MODE=true
NEXT_PUBLIC_FEATURE_OVERRIDE_MODE=false
```

## Uso en el Código

### Verificación Básica de Feature Flags

```typescript
import { isFeatureEnabled, FeatureFlag } from '@/lib/featureFlags';

// Verificar si RLS está habilitado
if (isFeatureEnabled(FeatureFlag.RLS_ENABLED)) {
  // Aplicar RLS
  return applyRLSContext(query, context);
} else {
  // Usar consulta sin RLS
  return query;
}
```

### Verificación por Tabla

```typescript
import { isRLSEnabledForTable } from '@/lib/featureFlags';

// Verificar RLS para tabla específica
if (isRLSEnabledForTable('users')) {
  // Aplicar RLS solo para la tabla users
  query = query.eq('organization_id', organizationId);
}
```

### Hooks de React

```typescript
import { useFeatureFlag, useTableRLS, FeatureFlag } from '@/lib/featureFlags';

function MyComponent() {
  // Hook para feature flag específico
  const [rlsEnabled, setRLSEnabled] = useFeatureFlag(FeatureFlag.RLS_ENABLED);
  
  // Hook para tabla específica
  const userTableRLS = useTableRLS('users');
  
  // Override en desarrollo (solo funciona en dev/test)
  const handleToggleRLS = () => {
    setRLSEnabled(!rlsEnabled);
  };
  
  return (
    <div>
      <p>RLS Global: {rlsEnabled ? 'Enabled' : 'Disabled'}</p>
      <p>Users Table RLS: {userTableRLS ? 'Enabled' : 'Disabled'}</p>
      {process.env.NODE_ENV === 'development' && (
        <button onClick={handleToggleRLS}>
          Toggle RLS
        </button>
      )}
    </div>
  );
}
```

### Configuración Completa

```typescript
import { useFeatureConfig } from '@/lib/featureFlags';

function AdminPanel() {
  const { 
    config, 
    isFeatureEnabled, 
    validateFeatureConfig,
    getFeatureFlagStats,
    activateKillSwitch 
  } = useFeatureConfig();
  
  const issues = validateFeatureConfig();
  const stats = getFeatureFlagStats();
  
  return (
    <div>
      <h2>Feature Flags Status</h2>
      <pre>{JSON.stringify(config.flags, null, 2)}</pre>
      
      {issues.length > 0 && (
        <div className="alert-warning">
          <h3>Configuration Issues:</h3>
          <ul>
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        onClick={activateKillSwitch}
        className="emergency-button"
      >
        EMERGENCY: Activate Kill Switch
      </button>
    </div>
  );
}
```

## Integración con RLS Helpers

### En rlsHelpers.ts

```typescript
import { isFeatureEnabled, isRLSEnabledForTable, FeatureFlag } from '@/lib/featureFlags';

export async function getRLSContext(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<RLSContext> {
  // Verificar si RLS está habilitado globalmente
  if (!isFeatureEnabled(FeatureFlag.RLS_ENABLED)) {
    // Retornar contexto sin RLS o modo mock
    return createMockRLSContext(userId, 'mock-org-id');
  }
  
  // Continuar con la lógica normal...
  const [organizationId, userRole] = await Promise.all([
    getUserOrganizationId(supabaseClient, userId),
    getUserRole(supabaseClient, userId)
  ]);

  return {
    userId,
    organizationId,
    userRole,
    supabaseClient
  };
}

export function applyRLSContext<T>(
  query: any,
  context: RLSContext,
  tableName?: string
): any {
  // Verificar si la tabla específica tiene RLS habilitado
  if (tableName && !isRLSEnabledForTable(tableName)) {
    return query; // No aplicar RLS para esta tabla
  }
  
  // Aplicar filtro de organización
  return query.eq('organization_id', context.organizationId);
}
```

### En useSupabase.ts

```typescript
import { isFeatureEnabled, isMockAuthEnabled, FeatureFlag } from '@/lib/featureFlags';

export const useSupabase = () => {
  const mockAuthEnabled = isMockAuthEnabled();
  
  if (mockAuthEnabled) {
    // Usar datos mock
    return {
      supabase,
      user: mockUser,
      organization: mockOrganization
    };
  }
  
  // Usar autenticación real...
};
```

### En middleware RLS

```typescript
import { isFeatureEnabled, validateFeatureConfig, FeatureFlag } from '@/lib/featureFlags';

export async function validateRLSMiddleware(
  request: NextRequest,
  config: RLSMiddlewareConfig = {}
): Promise<RLSMiddlewareResult> {
  
  // Verificar configuración
  const configIssues = validateFeatureConfig();
  if (configIssues.length > 0) {
    console.warn('Feature flag configuration issues:', configIssues);
  }
  
  // Skip RLS si está deshabilitado
  if (!isFeatureEnabled(FeatureFlag.RLS_ENABLED)) {
    return { success: true }; // Allow without RLS
  }
  
  // Continuar con validación normal...
}
```

## Kill Switch de Emergencia

### Activación Manual

```typescript
import { activateKillSwitch, deactivateKillSwitch } from '@/lib/featureFlags';

// En caso de emergencia
activateKillSwitch(); // Desactiva TODO RLS inmediatamente

// Para restaurar
deactivateKillSwitch(); // Restaura configuración normal
```

### Por Variable de Entorno

```bash
# Activar kill switch
NEXT_PUBLIC_RLS_KILL_SWITCH=true
```

## Monitoreo y Debugging

### Logs de Uso

```typescript
import { getFeatureFlagLogs, getFeatureFlagStats } from '@/lib/featureFlags';

// Ver todos los logs
const logs = getFeatureFlagLogs();

// Ver logs de un flag específico
const rlsLogs = getFeatureFlagLogs('RLS_ENABLED');

// Obtener estadísticas
const stats = getFeatureFlagStats();
console.log('RLS usage:', stats['RLS_ENABLED']);
```

### Validación de Configuración

```typescript
import { validateFeatureConfig } from '@/lib/featureFlags';

const issues = validateFeatureConfig();
if (issues.length > 0) {
  console.warn('Configuration problems:', issues);
  // Enviar alerta a monitoring
}
```

## Estrategia de Rollout

### Fase 1: Preparación
1. Desplegar sistema de feature flags
2. Configurar todas las flags en `false`
3. Probar kill switch y overrides

### Fase 2: Rollout Gradual
1. Habilitar RLS globalmente: `NEXT_PUBLIC_FEATURE_RLS_ENABLED=true`
2. Habilitar rollout gradual: `NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT=true`
3. Habilitar tabla por tabla:
   ```bash
   NEXT_PUBLIC_RLS_TABLE_USERS=true
   # Monitorear, luego continuar...
   NEXT_PUBLIC_RLS_TABLE_USER_SESSIONS=true
   # etc...
   ```

### Fase 3: Completar y Limpiar
1. Todas las tablas con RLS habilitado
2. Desactivar rollout gradual: `NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT=false`
3. Limpiar variables específicas de tabla
4. Habilitar modo estricto: `NEXT_PUBLIC_RLS_STRICT_MODE=true`

## Troubleshooting

### RLS No Se Aplica
1. Verificar `NEXT_PUBLIC_FEATURE_RLS_ENABLED=true`
2. Verificar tabla específica si `GRADUAL_RLS_ROLLOUT=true`
3. Verificar que kill switch no esté activo
4. Revisar logs: `getFeatureFlagLogs('RLS_ENABLED')`

### Errores de Autenticación
1. En desarrollo: verificar `NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=true`
2. En producción: verificar `NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH=false`
3. Verificar bypass: `NEXT_PUBLIC_MOCK_AUTH_BYPASS`

### Performance Issues
1. Desactivar logging: `NEXT_PUBLIC_FEATURE_FLAG_LOGGING=false`
2. Verificar frecuencia de checks en hooks
3. Usar kill switch temporalmente si es necesario

## Seguridad

### Principios
1. **Fail Secure**: Defaults seguros en producción
2. **Kill Switch**: Desactivación inmediata en emergencias
3. **Audit Trail**: Logging de todos los cambios
4. **Environment Isolation**: Overrides solo en desarrollo

### Alertas Recomendadas
1. Kill switch activado
2. RLS deshabilitado en producción
3. Mock auth habilitado en producción
4. Configuración inconsistente
5. Overrides activos en producción