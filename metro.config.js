const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add this to handle the setPrototypeOf error
config.resolver.sourceExts.push('cjs');

module.exports = config;
