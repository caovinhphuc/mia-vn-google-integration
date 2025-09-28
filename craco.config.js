const webpack = require('webpack')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress source map warnings for Google API packages
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: 'pre',
        use: [
          {
            loader: require.resolve('source-map-loader'),
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                // Exclude problematic Google API packages from source map processing
                if (
                  resourcePath.includes('node_modules/agent-base') ||
                  resourcePath.includes('node_modules/gaxios') ||
                  resourcePath.includes('node_modules/google-auth-library') ||
                  resourcePath.includes('node_modules/google-logging-utils') ||
                  resourcePath.includes('node_modules/googleapis-common') ||
                  resourcePath.includes('node_modules/https-proxy-agent') ||
                  resourcePath.includes('node_modules/gcp-metadata')
                ) {
                  return false
                }
                return true
              },
            },
          },
        ],
      })

      // Add polyfills for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser.js'),
        querystring: require.resolve('querystring-es3'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        vm: require.resolve('vm-browserify'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert/'),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
        http2: false,
      }

      // Add plugins for global variables
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser.js',
        }),
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, '')
        }),
      ]

      return webpackConfig
    },
  },
}
