const dotenv = require('dotenv');
const webpack = require('webpack');

// Load environment variables from .env file if it exists
const envResult = dotenv.config();
const fileEnv = envResult.error ? {} : envResult.parsed || {};

// Only expose explicit keys to the client bundle
const EXPOSED_ENV_VARS = new Set([
  ...Object.keys(fileEnv),
  'API_BASE_URL'
]);

// Prefer runtime environment variables (Cloudflare, CI, etc.), fall back to .env
const combinedEnv = {};
EXPOSED_ENV_VARS.forEach((key) => {
  const value = process.env[key] ?? fileEnv[key];
  if (typeof value !== 'undefined') {
    combinedEnv[key] = value;
  }
});

// Map the gathered env vars to process.env.* so Angular can read them.
// Also stub a minimal process object so runtime guards (typeof process !== 'undefined')
// remain truthy in the browser bundle.
const envKeys = Object.entries(combinedEnv).reduce((prev, [key, value]) => {
  prev[`process.env.${key}`] = JSON.stringify(value);
  return prev;
}, {});

envKeys['process.env'] = JSON.stringify(combinedEnv);
envKeys['process'] = JSON.stringify({ env: combinedEnv });

// Export as a function for Angular 19 custom-webpack compatibility
module.exports = (config) => {
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.DefinePlugin(envKeys)
  );
  return config;
};
