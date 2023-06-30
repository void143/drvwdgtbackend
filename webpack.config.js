const path = require('path');

module.exports = {
  entry: './index.js',
  resolve: {
    fallback: {
      async_hooks: false,
      zlib: require.resolve('browserify-zlib'),
      querystring: require.resolve('querystring-es3'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      http: require.resolve('stream-http')
    }
  }
};