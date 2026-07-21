const REQUIRED_PROVIDER_KINDS = ['bom', 'supplier', 'inventory', 'quality', 'schedule', 'telemetry', 'work_order'];

function loadConfig(env = process.env) {
  const config = {
    env: env.NODE_ENV || 'development',
    databaseUrl: env.DATABASE_URL || '',
    jwtSecret: env.JWT_SECRET || '',
    corsOrigins: (env.CORS_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean),
    port: Number(env.PORT || 3009),
    providerKinds: (env.AUTHORITATIVE_PROVIDER_KINDS || '').split(',').map(x => x.trim()).filter(Boolean),
  };
  const errors = [];
  if (!config.databaseUrl) errors.push('DATABASE_URL is required');
  if (config.jwtSecret.length < 32) errors.push('JWT_SECRET must be at least 32 characters');
  if (!config.corsOrigins.length || config.corsOrigins.includes('*')) errors.push('CORS_ORIGINS must list explicit origins');
  if (config.env === 'production') {
    if (config.corsOrigins.some(origin => !origin.startsWith('https://'))) errors.push('Production CORS origins must use HTTPS');
    const missing = REQUIRED_PROVIDER_KINDS.filter(kind => !config.providerKinds.includes(kind));
    if (missing.length) errors.push(`Missing authoritative provider kinds: ${missing.join(', ')}`);
  }
  if (errors.length) throw new Error(`Invalid configuration: ${errors.join('; ')}`);
  return config;
}

module.exports = { loadConfig, REQUIRED_PROVIDER_KINDS };
