module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],  // includes the Router transform in SDK 50+
    plugins: [
      'react-native-reanimated/plugin', // must be last
    ],
  };
};
