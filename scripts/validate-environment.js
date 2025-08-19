#!/usr/bin/env node
/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are properly configured
 * for the Sales Advisor App. It should be run before deployment and during CI/CD.
 * 
 * Usage:
 *   node scripts/validate-environment.js [environment]
 *   npm run validate:env [environment]
 * 
 * Environment options: development, staging, production
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
};

// Environment variable definitions
const environmentVariables = {
  // CRITICAL - Required for basic functionality
  critical: {
    'NEXT_PUBLIC_SUPABASE_URL': {
      description: 'Supabase project URL',
      pattern: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
      environments: ['development', 'staging', 'production']
    },
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
      description: 'Supabase anonymous key',
      pattern: /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      environments: ['development', 'staging', 'production']
    },
    'SUPABASE_SERVICE_ROLE_KEY': {
      description: 'Supabase service role key (CRITICAL - server-side only)',
      pattern: /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      environments: ['development', 'staging', 'production'],
      sensitive: true
    },
    'ANTHROPIC_API_KEY': {
      description: 'Anthropic Claude API key',
      pattern: /^sk-ant-api03-[A-Za-z0-9-_]{95}$/,
      environments: ['development', 'staging', 'production'],
      sensitive: true
    }
  },

  // HIGH PRIORITY - Required for authentication
  highPriority: {
    'GOOGLE_CLIENT_ID': {
      description: 'Google OAuth Client ID',
      pattern: /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/,
      environments: ['development', 'staging', 'production']
    },
    'GOOGLE_CLIENT_SECRET': {
      description: 'Google OAuth Client Secret',
      pattern: /^GOCSPX-[A-Za-z0-9-_]{28}$/,
      environments: ['development', 'staging', 'production'],
      sensitive: true
    },
    'GOOGLE_REDIRECT_URI': {
      description: 'Google OAuth Redirect URI',
      pattern: /^https?:\/\/.+\/api\/auth\/callback\/google$/,
      environments: ['development', 'staging', 'production'],
      validate: (value, env) => {
        const envUrls = {
          development: 'http://localhost:3001/api/auth/callback/google',
          staging: /^https:\/\/.*\.vercel\.app\/api\/auth\/callback\/google$/,
          production: /^https:\/\/.*\.vercel\.app\/api\/auth\/callback\/google$/
        };
        
        // In Vercel, accept any vercel.app URL
        if (process.env.VERCEL) {
          return /^https:\/\/.*\.vercel\.app\/api\/auth\/callback\/google$/.test(value);
        }
        
        if (env === 'development' && !process.env.VERCEL) {
          return value === envUrls.development;
        } else {
          return envUrls[env].test(value);
        }
      }
    },
    'NEXT_PUBLIC_APP_URL': {
      description: 'Application URL',
      pattern: /^https?:\/\/.+$/,
      environments: ['development', 'staging', 'production'],
      validate: (value, env) => {
        const patterns = {
          development: /^https?:\/\/localhost:[0-9]+$/,
          staging: /^https:\/\/.*\.vercel\.app$/,
          production: /^https:\/\/.*\.vercel\.app$/
        };
        
        // In Vercel, accept any vercel.app URL
        if (process.env.VERCEL) {
          return /^https:\/\/.*\.vercel\.app$/.test(value);
        }
        
        if (env === 'development' && !process.env.VERCEL) {
          return patterns.development.test(value);
        } else {
          return patterns[env] ? patterns[env].test(value) : true;
        }
      }
    }
  },

  // MEDIUM PRIORITY - Optional but recommended
  mediumPriority: {
    'N8N_WEBHOOK_URL': {
      description: 'N8N webhook URL for contact enrichment',
      pattern: /^https:\/\/.+$/,
      environments: ['staging', 'production'],
      optional: true
    },
    'N8N_WEBHOOK_SECRET': {
      description: 'N8N webhook secret for validation',
      pattern: /.{16,}/,
      environments: ['staging', 'production'],
      optional: true,
      sensitive: true
    },
    'ELEVENLABS_API_KEY': {
      description: 'ElevenLabs API key for voice synthesis',
      pattern: /^[a-f0-9]{32}$/,
      environments: ['staging', 'production'],
      optional: true,
      sensitive: true
    }
  },

  // LOW PRIORITY - Optional features
  lowPriority: {
    'OPENAI_API_KEY': {
      description: 'OpenAI API key (alternative to Anthropic)',
      pattern: /^sk-[A-Za-z0-9]{48}$/,
      environments: ['development', 'staging', 'production'],
      optional: true,
      sensitive: true
    },
    'NEXTAUTH_SECRET': {
      description: 'NextAuth.js secret for JWT signing',
      pattern: /.{32,}/,
      environments: ['staging', 'production'],
      optional: true,
      sensitive: true
    }
  }
};

// Feature flag validation
const featureFlags = {
  'NEXT_PUBLIC_ENVIRONMENT': {
    description: 'Environment identifier',
    validValues: ['development', 'staging', 'production'],
    required: true
  },
  'NEXT_PUBLIC_FEATURE_RLS_ENABLED': {
    description: 'RLS global toggle',
    validValues: ['true', 'false'],
    environmentDefaults: {
      development: 'false',
      staging: 'true',
      production: 'true'
    }
  },
  'NEXT_PUBLIC_FEATURE_USE_MOCK_AUTH': {
    description: 'Mock authentication for development',
    validValues: ['true', 'false'],
    environmentDefaults: {
      development: 'true',
      staging: 'false',
      production: 'false'
    }
  },
  'NEXT_PUBLIC_RLS_STRICT_MODE': {
    description: 'RLS strict mode',
    validValues: ['true', 'false'],
    environmentDefaults: {
      development: 'false',
      staging: 'false',
      production: 'true'
    }
  }
};

// Load environment variables from file if specified
function loadEnvironmentFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      env[key.trim()] = value;
    }
  });
  
  return env;
}

// Validate a single environment variable
function validateVariable(key, config, value, environment) {
  const results = {
    valid: false,
    errors: [],
    warnings: [],
    info: []
  };

  // Check if variable is required for this environment
  const isRequired = !config.optional && config.environments.includes(environment);
  
  if (!value) {
    if (isRequired) {
      results.errors.push(`Missing required variable: ${key}`);
    } else {
      results.warnings.push(`Optional variable not set: ${key}`);
    }
    return results;
  }

  // Check for placeholder values
  const placeholders = [
    'your_',
    'placeholder',
    'example',
    'test_',
    'demo_',
    'changeme'
  ];
  
  if (placeholders.some(placeholder => value.toLowerCase().includes(placeholder))) {
    results.errors.push(`${key} contains placeholder value: ${value.substring(0, 20)}...`);
    return results;
  }

  // Pattern validation
  if (config.pattern && !config.pattern.test(value)) {
    results.errors.push(`${key} format invalid. Expected pattern: ${config.pattern}`);
    return results;
  }

  // Custom validation
  if (config.validate && !config.validate(value, environment)) {
    results.errors.push(`${key} validation failed for ${environment} environment`);
    return results;
  }

  // Sensitive variable checks
  if (config.sensitive) {
    if (value.length < 16) {
      results.warnings.push(`${key} seems too short for a secure key`);
    }
    results.info.push(`${key} is properly configured (sensitive value hidden)`);
  } else {
    results.info.push(`${key} = ${value}`);
  }

  results.valid = true;
  return results;
}

// Validate feature flags
function validateFeatureFlags(env, environment) {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  Object.entries(featureFlags).forEach(([key, config]) => {
    const value = env[key];
    
    if (!value && config.required) {
      results.errors.push(`Missing required feature flag: ${key}`);
      results.valid = false;
      return;
    }

    if (value && !config.validValues.includes(value)) {
      results.errors.push(`Invalid value for ${key}: ${value}. Valid values: ${config.validValues.join(', ')}`);
      results.valid = false;
      return;
    }

    // Check environment-specific defaults
    if (config.environmentDefaults && config.environmentDefaults[environment]) {
      const expectedValue = config.environmentDefaults[environment];
      if (value !== expectedValue) {
        results.warnings.push(`${key} is ${value}, but ${expectedValue} is recommended for ${environment}`);
      }
    }

    if (value) {
      results.info.push(`${key} = ${value}`);
    }
  });

  return results;
}

// Main validation function
function validateEnvironment(environment = 'development') {
  // Auto-detect environment from NEXT_PUBLIC_ENVIRONMENT or VERCEL_ENV
  if (process.env.NEXT_PUBLIC_ENVIRONMENT) {
    environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  } else if (process.env.VERCEL_ENV === 'production') {
    environment = 'production';
  } else if (process.env.VERCEL_ENV === 'preview') {
    environment = 'staging';
  }
  
  log.header(`Validating environment configuration for: ${environment.toUpperCase()}`);
  console.log('');

  // Load environment variables
  const envFiles = [
    '.env',
    `.env.${environment}`,
    '.env.local'
  ];

  let env = { ...process.env };
  
  // Load from files if they exist
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const fileEnv = loadEnvironmentFile(filePath);
      env = { ...env, ...fileEnv };
      log.info(`Loaded variables from ${file}`);
    }
  });

  console.log('');

  // Validation results
  let totalErrors = 0;
  let totalWarnings = 0;
  const criticalMissing = [];

  // Validate all variable categories
  const categories = [
    { name: 'CRITICAL', vars: environmentVariables.critical },
    { name: 'HIGH PRIORITY', vars: environmentVariables.highPriority },
    { name: 'MEDIUM PRIORITY', vars: environmentVariables.mediumPriority },
    { name: 'LOW PRIORITY', vars: environmentVariables.lowPriority }
  ];

  categories.forEach(({ name, vars }) => {
    log.header(`${name} Variables:`);
    
    Object.entries(vars).forEach(([key, config]) => {
      const results = validateVariable(key, config, env[key], environment);
      
      totalErrors += results.errors.length;
      totalWarnings += results.warnings.length;
      
      if (results.errors.length > 0) {
        results.errors.forEach(error => log.error(error));
        if (name === 'CRITICAL') {
          criticalMissing.push(key);
        }
      }
      
      if (results.warnings.length > 0) {
        results.warnings.forEach(warning => log.warning(warning));
      }
      
      if (results.valid && results.info.length > 0) {
        results.info.forEach(info => {
          if (config.sensitive) {
            log.success(`${key} is configured (value hidden for security)`);
          } else {
            log.success(info);
          }
        });
      }
    });
    
    console.log('');
  });

  // Validate feature flags
  log.header('Feature Flags:');
  const flagResults = validateFeatureFlags(env, environment);
  
  totalErrors += flagResults.errors.length;
  totalWarnings += flagResults.warnings.length;
  
  flagResults.errors.forEach(error => log.error(error));
  flagResults.warnings.forEach(warning => log.warning(warning));
  flagResults.info.forEach(info => log.success(info));
  
  console.log('');

  // Security checks
  log.header('Security Validation:');
  
  // Check for committed secrets
  const committedFiles = ['.env.local', '.env.production'];
  committedFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      // Check if file is tracked by git
      try {
        const { execSync } = require('child_process');
        execSync(`git ls-files --error-unmatch ${file}`, { stdio: 'ignore' });
        log.error(`${file} is tracked by git - this is a security risk!`);
        totalErrors++;
      } catch (e) {
        log.success(`${file} is properly excluded from git`);
      }
    }
  });

  // Check service role key vs anon key
  if (env.SUPABASE_SERVICE_ROLE_KEY && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (env.SUPABASE_SERVICE_ROLE_KEY === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      log.error('Service role key is same as anon key - this is incorrect!');
      totalErrors++;
    } else {
      log.success('Service role key is different from anon key');
    }
  }

  console.log('');

  // Summary
  log.header('Validation Summary:');
  console.log(`Environment: ${colors.cyan}${environment}${colors.reset}`);
  console.log(`Total Errors: ${totalErrors > 0 ? colors.red : colors.green}${totalErrors}${colors.reset}`);
  console.log(`Total Warnings: ${totalWarnings > 0 ? colors.yellow : colors.green}${totalWarnings}${colors.reset}`);
  
  if (criticalMissing.length > 0) {
    console.log(`${colors.red}Critical missing variables: ${criticalMissing.join(', ')}${colors.reset}`);
  }

  console.log('');

  // Exit codes
  if (totalErrors > 0) {
    log.error('Environment validation failed! Please fix the errors above.');
    
    if (criticalMissing.length > 0) {
      console.log('');
      log.header('Quick Setup Guide:');
      console.log('1. Go to Supabase Dashboard → Settings → API');
      console.log('2. Copy service_role key to SUPABASE_SERVICE_ROLE_KEY');
      console.log('3. Set up Google OAuth credentials');
      console.log('4. Configure Anthropic API key');
      console.log('5. Run this script again to validate');
    }
    
    process.exit(1);
  } else if (totalWarnings > 0) {
    log.warning('Environment validation passed with warnings. Consider addressing warnings for optimal configuration.');
    process.exit(0);
  } else {
    log.success('Environment validation passed! All variables are properly configured.');
    process.exit(0);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';
  
  if (!['development', 'staging', 'production'].includes(environment)) {
    log.error(`Invalid environment: ${environment}`);
    log.info('Valid environments: development, staging, production');
    process.exit(1);
  }
  
  validateEnvironment(environment);
}

module.exports = { validateEnvironment };