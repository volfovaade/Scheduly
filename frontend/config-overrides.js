module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        enforce: 'pre',
        test: /\.js$/,
        loader: require.resolve('source-map-loader'),
        exclude: [/node_modules/], // Ignore all node_modules
      });
      return webpackConfig;
    },
  },
};