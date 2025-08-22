# Solución: Problema de Desconexión de Supabase

## Problema Identificado
La aplicación se desconectaba de Supabase después de 1-2 minutos mostrando:
```
💀 Supabase health check error: Error: Health check timeout
```

## Causas Raíz

### 1. Query Incorrecta en Health Check
- **Problema**: Usaba `.single()` que espera exactamente 1 fila
- **Error**: Si había 0 o múltiples usuarios, fallaba
- **Solución**: Removido `.single()`, ahora funciona con cualquier cantidad de filas

### 2. Timeout Muy Corto
- **Problema**: 5 segundos era insuficiente en conexiones lentas
- **Solución**: Aumentado a 10 segundos

### 3. Health Checks Muy Frecuentes
- **Problema**: Cada 30 segundos podía sobrecargar
- **Solución**: Reducido a cada 60 segundos

### 4. Múltiples Instancias del Cliente (Pendiente)
- **Problema**: Más de 40 archivos crean su propia instancia de Supabase
- **Impacto**: Agotamiento de conexiones y recursos
- **Solución Futura**: Centralizar en un singleton

## Cambios Implementados

### `/src/hooks/useSupabaseHealth.ts`

**Antes:**
```typescript
const queryPromise = supabase
  .from('users')
  .select('id')
  .limit(1)
  .single()  // ❌ Falla si hay 0 o >1 filas

setTimeout(() => reject(new Error('Health check timeout')), 5000)  // ❌ Muy corto

setInterval(() => checkHealth(), 30000)  // ❌ Muy frecuente
```

**Después:**
```typescript
const queryPromise = supabase
  .from('users')
  .select('id')
  .limit(1)
  // ✅ Sin .single() - funciona con cualquier cantidad

setTimeout(() => reject(new Error('Health check timeout')), 10000)  // ✅ 10 segundos

setInterval(() => checkHealth(), 60000)  // ✅ Cada 60 segundos
```

## Recomendaciones Adicionales

### Corto Plazo
1. ✅ Aplicar los cambios del health check (HECHO)
2. ⏳ Monitorear si el problema persiste
3. ⏳ Si persiste, desactivar health checks temporalmente

### Mediano Plazo
1. Centralizar todas las instancias del cliente Supabase
2. Implementar un singleton pattern
3. Reducir el número de suscripciones real-time activas

### Largo Plazo
1. Implementar connection pooling
2. Añadir métricas de performance
3. Crear sistema de retry con backoff exponencial

## Cómo Verificar que Funciona

1. Abrir la aplicación
2. Navegar normalmente por 5+ minutos
3. Verificar en consola:
   - ✅ `Supabase is healthy - XXXms` cada 60 segundos
   - ❌ No debe aparecer `Health check timeout`

## Si el Problema Persiste

Si después de estos cambios sigue desconectándose:

1. **Desactivar Health Checks Temporalmente:**
```typescript
// En useSupabaseHealth.ts, comentar:
// const intervalId = setInterval(() => {
//   checkHealth()
// }, 60000)
```

2. **Verificar en Supabase Dashboard:**
   - Límites de conexión
   - Uso de recursos
   - Logs de errores

3. **Reducir Suscripciones Real-time:**
   - Revisar `/src/lib/supabase-manager.ts`
   - Limitar a máximo 5 canales activos

## Archivos Modificados
- `/src/hooks/useSupabaseHealth.ts` - Health check corregido

## Archivos que Necesitan Revisión
- Más de 40 archivos creando instancias de Supabase (ver lista con `grep -r "createClient" src/`)