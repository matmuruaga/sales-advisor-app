/**
 * Feature Flags System for RLS Gradual Rollout
 * 
 * Provides robust feature flag management for controlling the rollout of Row Level Security (RLS)
 * across tables, with support for environment-based configuration, table-specific flags,
 * and emergency kill switches.
 * 
 * Key Features:
 * - Environment-based configuration (dev/staging/prod)
 * - Table-specific RLS controls
 * - Emergency kill switch
 * - React hooks integration
 * - Comprehensive logging and monitoring
 * - Safe defaults (security-first)
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Core feature flags enum for type safety
 */
export enum FeatureFlag {
  RLS_ENABLED = 'RLS_ENABLED',
  USE_MOCK_AUTH = 'USE_MOCK_AUTH',
  GRADUAL_RLS_ROLLOUT = 'GRADUAL_RLS_ROLLOUT',
  RLS_KILL_SWITCH = 'RLS_KILL_SWITCH',
  ENABLE_FEATURE_FLAG_LOGGING = 'ENABLE_FEATURE_FLAG_LOGGING',
  MOCK_AUTH_BYPASS = 'MOCK_AUTH_BYPASS',
  RLS_STRICT_MODE = 'RLS_STRICT_MODE',
  FEATURE_FLAG_OVERRIDE_MODE = 'FEATURE_FLAG_OVERRIDE_MODE'
}

/**
 * Tables that require RLS configuration
 */
export enum RLSTable {
  USERS = 'users',
  USER_SESSIONS = 'user_sessions',
  USER_PERFORMANCE = 'user_performance',
  AI_MODEL_CONFIGS = 'ai_model_configs',
  API_RATE_LIMITS = 'api_rate_limits',
  AUTH_SESSION_MONITORING = 'auth_session_monitoring',
  CONTACT_EMBEDDINGS = 'contact_embeddings',
  REAL_TIME_PRESENCE = 'real_time_presence',
  SYSTEM_LOGS = 'system_logs'
}

/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

/**
 * Feature flags configuration interface
 */
export interface FeatureFlags {
  [FeatureFlag.RLS_ENABLED]: boolean;
  [FeatureFlag.USE_MOCK_AUTH]: boolean;
  [FeatureFlag.GRADUAL_RLS_ROLLOUT]: boolean;
  [FeatureFlag.RLS_KILL_SWITCH]: boolean;
  [FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]: boolean;
  [FeatureFlag.MOCK_AUTH_BYPASS]: boolean;
  [FeatureFlag.RLS_STRICT_MODE]: boolean;
  [FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]: boolean;
}

/**
 * Table-specific RLS configuration
 */
export interface TableRLSConfig {
  [key: string]: boolean;
}

/**
 * Complete feature configuration
 */
export interface FeatureConfig {
  flags: FeatureFlags;
  tableRLS: TableRLSConfig;
  environment: Environment;
  killSwitchActive: boolean;
  overrides: Partial<FeatureFlags>;
  lastUpdate: number;
}

/**
 * Feature flag usage log entry
 */
export interface FeatureFlagUsageLog {
  flag: string;
  value: boolean;
  timestamp: number;
  context?: Record<string, any>;
  source: 'environment' | 'override' | 'default';
}

/**
 * Global feature configuration state
 */
let globalFeatureConfig: FeatureConfig | null = null;
let featureUsageLogs: FeatureFlagUsageLog[] = [];
let configInitialized = false;

/**
 * Environment variable keys mapping
 */
const ENV_KEYS = {
  [FeatureFlag.RLS_ENABLED]: 'NEXT_PUBLIC_FEATURE_RLS_ENABLED',
  [FeatureFlag.USE_MOCK_AUTH]: 'NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH',
  [FeatureFlag.GRADUAL_RLS_ROLLOUT]: 'NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT',
  [FeatureFlag.RLS_KILL_SWITCH]: 'NEXT_PUBLIC_RLS_KILL_SWITCH',
  [FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]: 'NEXT_PUBLIC_FEATURE_FLAG_LOGGING',
  [FeatureFlag.MOCK_AUTH_BYPASS]: 'NEXT_PUBLIC_MOCK_AUTH_BYPASS',
  [FeatureFlag.RLS_STRICT_MODE]: 'NEXT_PUBLIC_RLS_STRICT_MODE',
  [FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]: 'NEXT_PUBLIC_FEATURE_OVERRIDE_MODE'
} as const;

/**
 * Table RLS environment variable prefix
 */
const TABLE_RLS_PREFIX = 'NEXT_PUBLIC_RLS_TABLE_';

/**
 * Get current environment
 */
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase();
  const nextEnv = process.env.NEXT_PUBLIC_ENVIRONMENT?.toLowerCase();
  
  if (nextEnv) {
    switch (nextEnv) {
      case 'development':
      case 'dev':
        return Environment.DEVELOPMENT;
      case 'staging':
      case 'stage':
        return Environment.STAGING;
      case 'production':
      case 'prod':
        return Environment.PRODUCTION;
      case 'test':
        return Environment.TEST;
    }
  }
  
  switch (nodeEnv) {
    case 'development':
      return Environment.DEVELOPMENT;
    case 'production':
      return Environment.PRODUCTION;
    case 'test':
      return Environment.TEST;
    default:
      return Environment.DEVELOPMENT;
  }
}

/**
 * Get default feature flags based on environment
 */
function getEnvironmentDefaults(environment: Environment): FeatureFlags {
  switch (environment) {
    case Environment.PRODUCTION:
      return {
        [FeatureFlag.RLS_ENABLED]: true,
        [FeatureFlag.USE_MOCK_AUTH]: false,
        [FeatureFlag.GRADUAL_RLS_ROLLOUT]: true,
        [FeatureFlag.RLS_KILL_SWITCH]: false,
        [FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]: true,
        [FeatureFlag.MOCK_AUTH_BYPASS]: false,
        [FeatureFlag.RLS_STRICT_MODE]: true,
        [FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]: false
      };
      
    case Environment.STAGING:
      return {
        [FeatureFlag.RLS_ENABLED]: true,
        [FeatureFlag.USE_MOCK_AUTH]: false,
        [FeatureFlag.GRADUAL_RLS_ROLLOUT]: true,
        [FeatureFlag.RLS_KILL_SWITCH]: false,
        [FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]: true,
        [FeatureFlag.MOCK_AUTH_BYPASS]: false,
        [FeatureFlag.RLS_STRICT_MODE]: false,
        [FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]: true
      };
      
    case Environment.DEVELOPMENT:
    default:
      return {
        [FeatureFlag.RLS_ENABLED]: false,
        [FeatureFlag.USE_MOCK_AUTH]: true,
        [FeatureFlag.GRADUAL_RLS_ROLLOUT]: true,
        [FeatureFlag.RLS_KILL_SWITCH]: false,
        [FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]: true,
        [FeatureFlag.MOCK_AUTH_BYPASS]: true,
        [FeatureFlag.RLS_STRICT_MODE]: false,
        [FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]: true
      };
      
    case Environment.TEST:
      return {
        [FeatureFlag.RLS_ENABLED]: false,
        [FeatureFlag.USE_MOCK_AUTH]: true,
        [FeatureFlag.GRADUAL_RLS_ROLLOUT]: false,
        [FeatureFlag.RLS_KILL_SWITCH]: false,
        [FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]: false,
        [FeatureFlag.MOCK_AUTH_BYPASS]: true,
        [FeatureFlag.RLS_STRICT_MODE]: false,
        [FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]: true
      };
  }
}

/**
 * Get default table RLS configuration
 */
function getTableRLSDefaults(environment: Environment): TableRLSConfig {
  const tables = Object.values(RLSTable);
  const config: TableRLSConfig = {};
  
  // In production, default to enabled for security
  // In development, default to disabled for easier testing
  const defaultValue = environment === Environment.PRODUCTION;
  
  tables.forEach(table => {
    config[table] = defaultValue;
  });
  
  return config;
}

/**
 * Parse boolean from environment variable
 */
function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  const normalizedValue = value.toLowerCase().trim();
  
  if (normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes') {
    return true;
  }
  
  if (normalizedValue === 'false' || normalizedValue === '0' || normalizedValue === 'no') {
    return false;
  }
  
  return defaultValue;
}

/**
 * Load configuration from environment variables
 */
function loadEnvironmentConfig(): FeatureConfig {
  const environment = getCurrentEnvironment();
  const defaults = getEnvironmentDefaults(environment);
  const tableDefaults = getTableRLSDefaults(environment);
  
  // Load feature flags from environment
  const flags: FeatureFlags = {} as FeatureFlags;
  
  Object.entries(ENV_KEYS).forEach(([flag, envKey]) => {
    const envValue = process.env[envKey];
    const defaultValue = defaults[flag as FeatureFlag];
    flags[flag as FeatureFlag] = parseBooleanEnv(envValue, defaultValue);
  });
  
  // Load table-specific RLS settings
  const tableRLS: TableRLSConfig = { ...tableDefaults };
  
  Object.values(RLSTable).forEach(table => {
    const envKey = `${TABLE_RLS_PREFIX}${table.toUpperCase()}`;
    const envValue = process.env[envKey];
    const defaultValue = tableDefaults[table];
    tableRLS[table] = parseBooleanEnv(envValue, defaultValue);
  });
  
  // Check for kill switch
  const killSwitchActive = parseBooleanEnv(
    process.env.NEXT_PUBLIC_RLS_KILL_SWITCH,
    false
  );
  
  return {
    flags,
    tableRLS,
    environment,
    killSwitchActive,
    overrides: {},
    lastUpdate: Date.now()
  };
}

/**
 * Initialize feature configuration
 */
function initializeConfig(): FeatureConfig {
  if (!globalFeatureConfig || !configInitialized) {
    globalFeatureConfig = loadEnvironmentConfig();
    configInitialized = true;
    
    // Log initialization in development
    if (globalFeatureConfig.environment === Environment.DEVELOPMENT) {
      console.log('Feature flags initialized:', {
        environment: globalFeatureConfig.environment,
        flags: globalFeatureConfig.flags,
        tableRLS: globalFeatureConfig.tableRLS,
        killSwitchActive: globalFeatureConfig.killSwitchActive
      });
    }
  }
  
  return globalFeatureConfig;
}

/**
 * Get current feature configuration
 */
export function getFeatureConfig(): FeatureConfig {
  return initializeConfig();
}

/**
 * Check if a feature flag is enabled
 * @param flag - Feature flag to check
 * @param context - Additional context for logging
 * @returns Whether the flag is enabled
 */
export function isFeatureEnabled(
  flag: FeatureFlag | string, 
  context?: Record<string, any>
): boolean {
  const config = getFeatureConfig();
  
  // Kill switch overrides everything
  if (config.killSwitchActive && flag === FeatureFlag.RLS_ENABLED) {
    logFeatureUsage(flag, false, context, 'kill-switch');
    return false;
  }
  
  // Check for overrides first (development only)
  if (config.flags[FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE] && 
      config.overrides[flag as FeatureFlag] !== undefined) {
    const value = config.overrides[flag as FeatureFlag]!;
    logFeatureUsage(flag, value, context, 'override');
    return value;
  }
  
  // Get from configuration
  const value = config.flags[flag as FeatureFlag] ?? false;
  logFeatureUsage(flag, value, context, 'environment');
  
  return value;
}

/**
 * Check if RLS is enabled for a specific table
 * @param tableName - Table name to check
 * @param context - Additional context for logging
 * @returns Whether RLS is enabled for the table
 */
export function isRLSEnabledForTable(
  tableName: string, 
  context?: Record<string, any>
): boolean {
  const config = getFeatureConfig();
  
  // Kill switch disables all RLS
  if (config.killSwitchActive) {
    logFeatureUsage(`RLS_TABLE_${tableName}`, false, context, 'kill-switch');
    return false;
  }
  
  // If global RLS is disabled, no table has RLS
  if (!isFeatureEnabled(FeatureFlag.RLS_ENABLED, context)) {
    logFeatureUsage(`RLS_TABLE_${tableName}`, false, context, 'global-disabled');
    return false;
  }
  
  // If gradual rollout is disabled, use global RLS setting
  if (!isFeatureEnabled(FeatureFlag.GRADUAL_RLS_ROLLOUT, context)) {
    const globalEnabled = isFeatureEnabled(FeatureFlag.RLS_ENABLED, context);
    logFeatureUsage(`RLS_TABLE_${tableName}`, globalEnabled, context, 'global-rollout');
    return globalEnabled;
  }
  
  // Check table-specific setting
  const tableEnabled = config.tableRLS[tableName] ?? false;
  logFeatureUsage(`RLS_TABLE_${tableName}`, tableEnabled, context, 'table-specific');
  
  return tableEnabled;
}

/**
 * Override a feature flag (development only)
 * @param flag - Feature flag to override
 * @param value - Value to set
 * @returns Success status
 */
export function overrideFeature(flag: FeatureFlag, value: boolean): boolean {
  const config = getFeatureConfig();
  
  // Only allow overrides in development/test environments
  if (config.environment !== Environment.DEVELOPMENT && 
      config.environment !== Environment.TEST) {
    console.warn(`Feature flag overrides not allowed in ${config.environment}`);
    return false;
  }
  
  if (!config.flags[FeatureFlag.FEATURE_FLAG_OVERRIDE_MODE]) {
    console.warn('Feature flag override mode is disabled');
    return false;
  }
  
  config.overrides[flag] = value;
  config.lastUpdate = Date.now();
  
  console.log(`Feature flag overridden: ${flag} = ${value}`);
  
  return true;
}

/**
 * Reset all feature flag overrides
 */
export function resetFeatures(): void {
  const config = getFeatureConfig();
  
  if (config.environment !== Environment.DEVELOPMENT && 
      config.environment !== Environment.TEST) {
    console.warn(`Feature flag reset not allowed in ${config.environment}`);
    return;
  }
  
  config.overrides = {};
  config.lastUpdate = Date.now();
  
  console.log('All feature flag overrides cleared');
}

/**
 * Log feature flag usage
 * @param flag - Feature flag name
 * @param value - Flag value
 * @param context - Additional context
 * @param source - Source of the value
 */
export function logFeatureUsage(
  flag: string, 
  value: boolean, 
  context?: Record<string, any>,
  source: 'environment' | 'override' | 'default' | 'kill-switch' | 'global-disabled' | 'global-rollout' | 'table-specific' = 'environment'
): void {
  const config = getFeatureConfig();
  
  if (!config.flags[FeatureFlag.ENABLE_FEATURE_FLAG_LOGGING]) {
    return;
  }
  
  const logEntry: FeatureFlagUsageLog = {
    flag,
    value,
    timestamp: Date.now(),
    context,
    source: source as any
  };
  
  featureUsageLogs.push(logEntry);
  
  // Keep only last 1000 entries to prevent memory leaks
  if (featureUsageLogs.length > 1000) {
    featureUsageLogs = featureUsageLogs.slice(-500);
  }
  
  // Log to console in development
  if (config.environment === Environment.DEVELOPMENT) {
    console.debug(`[FeatureFlag] ${flag}: ${value} (${source})`, context);
  }
}

/**
 * Get feature flag usage logs
 * @param flag - Optional flag to filter by
 * @returns Array of usage logs
 */
export function getFeatureFlagLogs(flag?: string): FeatureFlagUsageLog[] {
  if (flag) {
    return featureUsageLogs.filter(log => log.flag === flag);
  }
  return [...featureUsageLogs];
}

/**
 * Clear feature flag usage logs
 */
export function clearFeatureFlagLogs(): void {
  featureUsageLogs = [];
}

/**
 * Get feature flag statistics
 */
export function getFeatureFlagStats(): Record<string, { enabled: number; disabled: number; total: number }> {
  const stats: Record<string, { enabled: number; disabled: number; total: number }> = {};
  
  featureUsageLogs.forEach(log => {
    if (!stats[log.flag]) {
      stats[log.flag] = { enabled: 0, disabled: 0, total: 0 };
    }
    
    if (log.value) {
      stats[log.flag].enabled++;
    } else {
      stats[log.flag].disabled++;
    }
    
    stats[log.flag].total++;
  });
  
  return stats;
}

/**
 * Validate feature flag configuration
 * @returns Array of configuration issues
 */
export function validateFeatureConfig(): string[] {
  const config = getFeatureConfig();
  const issues: string[] = [];
  
  // Check for inconsistent configuration
  if (config.flags[FeatureFlag.RLS_ENABLED] && config.flags[FeatureFlag.USE_MOCK_AUTH]) {
    if (config.environment === Environment.PRODUCTION) {
      issues.push('RLS enabled with mock auth in production - security risk');
    }
  }
  
  if (!config.flags[FeatureFlag.RLS_ENABLED] && config.environment === Environment.PRODUCTION) {
    issues.push('RLS disabled in production environment - security risk');
  }
  
  if (config.killSwitchActive) {
    issues.push('Kill switch is active - all RLS disabled');
  }
  
  // Check table configuration
  const enabledTables = Object.entries(config.tableRLS).filter(([, enabled]) => enabled);
  const disabledTables = Object.entries(config.tableRLS).filter(([, enabled]) => !enabled);
  
  if (config.flags[FeatureFlag.RLS_ENABLED] && disabledTables.length > 0) {
    issues.push(`RLS enabled but ${disabledTables.length} tables have RLS disabled: ${disabledTables.map(([table]) => table).join(', ')}`);
  }
  
  if (config.environment === Environment.PRODUCTION && Object.keys(config.overrides).length > 0) {
    issues.push('Feature flag overrides active in production');
  }
  
  return issues;
}

/**
 * Emergency function to activate kill switch
 */
export function activateKillSwitch(): void {
  const config = getFeatureConfig();
  config.killSwitchActive = true;
  config.lastUpdate = Date.now();
  
  console.error('EMERGENCY: RLS Kill Switch Activated - All RLS disabled');
  
  // Log critical security event
  logFeatureUsage('KILL_SWITCH', true, { emergency: true }, 'override');
}

/**
 * Deactivate kill switch
 */
export function deactivateKillSwitch(): void {
  const config = getFeatureConfig();
  config.killSwitchActive = false;
  config.lastUpdate = Date.now();
  
  console.warn('RLS Kill Switch Deactivated - RLS restored to normal configuration');
  
  logFeatureUsage('KILL_SWITCH', false, { restored: true }, 'override');
}

/**
 * React hook for feature flags
 * @param flagName - Feature flag to monitor
 * @returns Current flag value and setter function
 */
export function useFeatureFlag(flagName: FeatureFlag): [boolean, (value: boolean) => boolean] {
  const [value, setValue] = useState(() => isFeatureEnabled(flagName));
  
  // In development, allow live updates
  const config = getFeatureConfig();
  
  useEffect(() => {
    if (config.environment === Environment.DEVELOPMENT || config.environment === Environment.TEST) {
      const interval = setInterval(() => {
        const currentValue = isFeatureEnabled(flagName);
        setValue(currentValue);
      }, 1000); // Check every second
      
      return () => clearInterval(interval);
    }
  }, [flagName, config.environment]);
  
  const setOverride = useCallback((newValue: boolean): boolean => {
    if (overrideFeature(flagName, newValue)) {
      setValue(newValue);
      return true;
    }
    return false;
  }, [flagName]);
  
  return [value, setOverride];
}

/**
 * React hook for table RLS status
 * @param tableName - Table name to monitor
 * @returns Current RLS status for the table
 */
export function useTableRLS(tableName: string): boolean {
  const [enabled, setEnabled] = useState(() => isRLSEnabledForTable(tableName));
  
  const config = getFeatureConfig();
  
  useEffect(() => {
    if (config.environment === Environment.DEVELOPMENT || config.environment === Environment.TEST) {
      const interval = setInterval(() => {
        const currentValue = isRLSEnabledForTable(tableName);
        setEnabled(currentValue);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [tableName, config.environment]);
  
  return enabled;
}

/**
 * React hook for feature flag configuration
 * @returns Complete feature configuration and utilities
 */
export function useFeatureConfig() {
  const [config, setConfig] = useState(() => getFeatureConfig());
  
  useEffect(() => {
    if (config.environment === Environment.DEVELOPMENT || config.environment === Environment.TEST) {
      const interval = setInterval(() => {
        const currentConfig = getFeatureConfig();
        if (currentConfig.lastUpdate > config.lastUpdate) {
          setConfig(currentConfig);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [config.lastUpdate, config.environment]);
  
  return {
    config,
    isFeatureEnabled,
    isRLSEnabledForTable,
    overrideFeature,
    resetFeatures,
    validateFeatureConfig,
    getFeatureFlagStats,
    activateKillSwitch,
    deactivateKillSwitch
  };
}

/**
 * Utility to check if we're in a safe environment for development features
 */
export function isDevEnvironment(): boolean {
  const config = getFeatureConfig();
  return config.environment === Environment.DEVELOPMENT || config.environment === Environment.TEST;
}

/**
 * Utility to check if strict mode is enabled
 */
export function isStrictModeEnabled(): boolean {
  return isFeatureEnabled(FeatureFlag.RLS_STRICT_MODE);
}

/**
 * Utility to check if mock auth is available
 */
export function isMockAuthEnabled(): boolean {
  return isFeatureEnabled(FeatureFlag.USE_MOCK_AUTH) || isFeatureEnabled(FeatureFlag.MOCK_AUTH_BYPASS);
}

/**
 * Export commonly used combinations for convenience
 */
export const FeatureFlagUtils = {
  isFeatureEnabled,
  isRLSEnabledForTable,
  isDevEnvironment,
  isStrictModeEnabled,
  isMockAuthEnabled,
  getFeatureConfig,
  validateFeatureConfig,
  activateKillSwitch,
  deactivateKillSwitch
};

/**
 * Export all table names for convenience
 */
export const TABLES_WITHOUT_RLS = Object.values(RLSTable);

/**
 * Default export with main functionality
 */
export default {
  FeatureFlag,
  RLSTable,
  Environment,
  isFeatureEnabled,
  isRLSEnabledForTable,
  getFeatureConfig,
  overrideFeature,
  resetFeatures,
  logFeatureUsage,
  validateFeatureConfig,
  useFeatureFlag,
  useTableRLS,
  useFeatureConfig,
  FeatureFlagUtils
};