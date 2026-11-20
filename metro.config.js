const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.blockList = [/\.tools\/.*/, /\.scaffold\/.*/];
config.watchFolders = [];

module.exports = config;
