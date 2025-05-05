const dotenv = require('dotenv');
const webpack = require('webpack');

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

// Map environment variables from .env to process.env.*
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  plugins: [
    // Make environment variables available to your app
    new webpack.DefinePlugin(envKeys)
  ]
};
