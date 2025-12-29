const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['react-native-maps'],
      },
    },
    argv
  );

  // Add alias to replace react-native-maps with a web-compatible shim
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-maps': path.resolve(__dirname, 'shims/react-native-maps-web.js'),
  };

  return config;
};
