/**
 * Feature Flags System Tests
 * 
 * Tests para el sistema de feature flags, incluyendo configuración por ambiente,
 * control de RLS por tabla, kill switch, y funcionalidades de override.
 */

import { 
  isFeatureEnabled, 
  isRLSEnabledForTable,
  getFeatureConfig,
  overrideFeature,
  resetFeatures,
  validateFeatureConfig,
  activateKillSwitch,
  deactivateKillSwitch,
  FeatureFlag,
  RLSTable,
  Environment,
  shouldBypassRLS,
  isDevEnvironment,
  isMockAuthEnabled
} from '../featureFlags';

// Mock environment variables for testing
const mockEnvVars = {
  'NODE_ENV': 'test',
  'NEXT_PUBLIC_ENVIRONMENT': 'development',
  'NEXT_PUBLIC_FEATURE_RLS_ENABLED': 'false',
  'NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH': 'true',
  'NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT': 'true',
  'NEXT_PUBLIC_RLS_KILL_SWITCH': 'false',
  'NEXT_PUBLIC_FEATURE_FLAG_LOGGING': 'true',
  'NEXT_PUBLIC_RLS_STRICT_MODE': 'false',
  'NEXT_PUBLIC_FEATURE_OVERRIDE_MODE': 'true',
  'NEXT_PUBLIC_RLS_TABLE_USERS': 'false',
  'NEXT_PUBLIC_RLS_TABLE_USER_SESSIONS': 'true'
};

describe('Feature Flags System', () => {
  
  beforeEach(() => {
    // Reset environment variables
    Object.keys(mockEnvVars).forEach(key => {
      process.env[key] = mockEnvVars[key as keyof typeof mockEnvVars];
    });
    
    // Reset feature flags
    resetFeatures();
  });

  afterEach(() => {
    // Clean up environment
    Object.keys(mockEnvVars).forEach(key => {
      delete process.env[key];
    });
  });

  describe('Basic Feature Flag Functionality', () => {
    
    test('should read feature flags from environment variables', () => {
      const config = getFeatureConfig();
      
      expect(config.environment).toBe(Environment.DEVELOPMENT);
      expect(config.flags[FeatureFlag.RLS_ENABLED]).toBe(false);
      expect(config.flags[FeatureFlag.USE_MOCK_AUTH]).toBe(true);
      expect(config.flags[FeatureFlag.GRADUAL_RLS_ROLLOUT]).toBe(true);
    });

    test('should return correct feature flag values', () => {
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(false);
      expect(isFeatureEnabled(FeatureFlag.USE_MOCK_AUTH)).toBe(true);
      expect(isFeatureEnabled(FeatureFlag.GRADUAL_RLS_ROLLOUT)).toBe(true);
    });

    test('should handle missing environment variables with defaults', () => {
      delete process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED;
      
      // Should use environment defaults (development = false)
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(false);
    });

  });

  describe('Table-Specific RLS Configuration', () => {
    
    test('should read table RLS configuration from environment', () => {
      expect(isRLSEnabledForTable('users')).toBe(false);
      expect(isRLSEnabledForTable('user_sessions')).toBe(true);
    });

    test('should default to environment default for unconfigured tables', () => {
      // contact_embeddings not configured, should use environment default
      expect(isRLSEnabledForTable('contact_embeddings')).toBe(false); // Development default
    });

    test('should respect global RLS setting when gradual rollout is disabled', () => {
      // Disable gradual rollout
      process.env.NEXT_PUBLIC_FEATURE_GRADUAL_RLS_ROLLOUT = 'false';
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'true';
      
      // All tables should follow global RLS setting
      expect(isRLSEnabledForTable('users')).toBe(true);
      expect(isRLSEnabledForTable('user_sessions')).toBe(true);
      expect(isRLSEnabledForTable('contact_embeddings')).toBe(true);
    });

    test('should disable all table RLS when global RLS is disabled', () => {
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'false';
      process.env.NEXT_PUBLIC_RLS_TABLE_USERS = 'true'; // This should be ignored
      
      expect(isRLSEnabledForTable('users')).toBe(false);
    });

  });

  describe('Kill Switch Functionality', () => {
    
    test('should activate kill switch and disable all RLS', () => {
      // First enable RLS
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'true';
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(true);
      
      // Activate kill switch
      activateKillSwitch();
      
      const config = getFeatureConfig();
      expect(config.killSwitchActive).toBe(true);
      
      // RLS should be disabled despite being enabled in config
      expect(isRLSEnabledForTable('users')).toBe(false);
    });

    test('should deactivate kill switch and restore normal operation', () => {
      activateKillSwitch();
      expect(getFeatureConfig().killSwitchActive).toBe(true);
      
      deactivateKillSwitch();
      expect(getFeatureConfig().killSwitchActive).toBe(false);
    });

  });

  describe('Override Functionality', () => {
    
    test('should allow overriding features in development', () => {
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(false);
      
      const success = overrideFeature(FeatureFlag.RLS_ENABLED, true);
      expect(success).toBe(true);
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(true);
    });

    test('should not allow overriding in production environment', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      
      const success = overrideFeature(FeatureFlag.RLS_ENABLED, true);
      expect(success).toBe(false);
    });

    test('should reset all overrides', () => {
      overrideFeature(FeatureFlag.RLS_ENABLED, true);
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(true);
      
      resetFeatures();
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(false);
    });

  });

  describe('Environment-Based Configuration', () => {
    
    test('should use development defaults', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'development';
      
      const config = getFeatureConfig();
      expect(config.flags[FeatureFlag.RLS_ENABLED]).toBe(false);
      expect(config.flags[FeatureFlag.USE_MOCK_AUTH]).toBe(true);
      expect(config.flags[FeatureFlag.RLS_STRICT_MODE]).toBe(false);
    });

    test('should use production defaults', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      // Clear specific env vars to use defaults
      delete process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED;
      delete process.env.NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH;
      delete process.env.NEXT_PUBLIC_RLS_STRICT_MODE;
      
      const config = getFeatureConfig();
      expect(config.flags[FeatureFlag.RLS_ENABLED]).toBe(true);
      expect(config.flags[FeatureFlag.USE_MOCK_AUTH]).toBe(false);
      expect(config.flags[FeatureFlag.RLS_STRICT_MODE]).toBe(true);
    });

    test('should use staging defaults', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'staging';
      delete process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED;
      delete process.env.NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH;
      delete process.env.NEXT_PUBLIC_RLS_STRICT_MODE;
      
      const config = getFeatureConfig();
      expect(config.flags[FeatureFlag.RLS_ENABLED]).toBe(true);
      expect(config.flags[FeatureFlag.USE_MOCK_AUTH]).toBe(false);
      expect(config.flags[FeatureFlag.RLS_STRICT_MODE]).toBe(false);
    });

  });

  describe('Configuration Validation', () => {
    
    test('should detect configuration issues', () => {
      // Set up problematic configuration
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'false'; // RLS disabled in prod
      
      const issues = validateFeatureConfig();
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(issue => issue.includes('production'))).toBe(true);
    });

    test('should detect kill switch activation', () => {
      activateKillSwitch();
      
      const issues = validateFeatureConfig();
      expect(issues.some(issue => issue.includes('Kill switch'))).toBe(true);
    });

    test('should validate table configuration consistency', () => {
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'true';
      process.env.NEXT_PUBLIC_RLS_TABLE_USERS = 'false';
      
      const issues = validateFeatureConfig();
      expect(issues.some(issue => issue.includes('tables have RLS disabled'))).toBe(true);
    });

  });

  describe('Helper Functions', () => {
    
    test('isDevEnvironment should work correctly', () => {
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'development';
      expect(isDevEnvironment()).toBe(true);
      
      process.env.NEXT_PUBLIC_ENVIRONMENT = 'production';
      expect(isDevEnvironment()).toBe(false);
    });

    test('isMockAuthEnabled should combine flags correctly', () => {
      process.env.NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH = 'true';
      expect(isMockAuthEnabled()).toBe(true);
      
      process.env.NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH = 'false';
      process.env.NEXT_PUBLIC_MOCK_AUTH_BYPASS = 'true';
      expect(isMockAuthEnabled()).toBe(true);
      
      process.env.NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH = 'false';
      process.env.NEXT_PUBLIC_MOCK_AUTH_BYPASS = 'false';
      expect(isMockAuthEnabled()).toBe(false);
    });

    test('shouldBypassRLS should work correctly', () => {
      // Global RLS disabled
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'false';
      expect(shouldBypassRLS('users')).toBe(true);
      
      // Global RLS enabled, table disabled
      process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'true';
      process.env.NEXT_PUBLIC_RLS_TABLE_USERS = 'false';
      expect(shouldBypassRLS('users')).toBe(true);
      
      // Both enabled
      process.env.NEXT_PUBLIC_RLS_TABLE_USERS = 'true';
      expect(shouldBypassRLS('users')).toBe(false);
    });

  });

  describe('Boolean Parsing', () => {
    
    test('should parse various boolean representations', () => {
      const testCases = [
        ['true', true],
        ['false', false],
        ['1', true],
        ['0', false],
        ['yes', true],
        ['no', false],
        ['TRUE', true],
        ['FALSE', false],
        ['', false], // Default when empty
        [undefined, false] // Default when undefined
      ];

      testCases.forEach(([input, expected]) => {
        process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = input as string;
        expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(expected);
      });
    });

  });

  describe('Edge Cases', () => {
    
    test('should handle non-existent feature flags gracefully', () => {
      expect(isFeatureEnabled('NON_EXISTENT_FLAG' as FeatureFlag)).toBe(false);
    });

    test('should handle non-existent tables gracefully', () => {
      expect(isRLSEnabledForTable('non_existent_table')).toBe(false);
    });

    test('should maintain state consistency during multiple operations', () => {
      // Enable RLS
      overrideFeature(FeatureFlag.RLS_ENABLED, true);
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(true);
      
      // Activate kill switch
      activateKillSwitch();
      expect(isRLSEnabledForTable('users')).toBe(false);
      
      // Deactivate kill switch
      deactivateKillSwitch();
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(true);
      
      // Reset should clear override
      resetFeatures();
      expect(isFeatureEnabled(FeatureFlag.RLS_ENABLED)).toBe(false);
    });

  });

});

// Integration tests with RLS helpers would go here
describe('Integration with RLS Helpers', () => {
  
  test('should integrate with shouldBypassRLS function', () => {
    process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'false';
    expect(shouldBypassRLS('users')).toBe(true);
    
    process.env.NEXT_PUBLIC_FEATURE_RLS_ENABLED = 'true';
    process.env.NEXT_PUBLIC_RLS_TABLE_USERS = 'true';
    expect(shouldBypassRLS('users')).toBe(false);
  });

  // Additional integration tests would verify:
  // - RLS context creation with feature flags
  // - Query application based on flags
  // - Middleware behavior with different configurations
  // - Authentication flow with mock auth flags

});

// Performance tests
describe('Performance Considerations', () => {
  
  test('should cache configuration for performance', () => {
    const start = Date.now();
    
    // Multiple calls should be fast due to caching
    for (let i = 0; i < 100; i++) {
      getFeatureConfig();
      isFeatureEnabled(FeatureFlag.RLS_ENABLED);
      isRLSEnabledForTable('users');
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  test('should limit log entries to prevent memory leaks', () => {
    // This would test that featureUsageLogs array doesn't grow indefinitely
    // Implementation depends on the actual logging mechanism
  });

});