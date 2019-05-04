'use strict'
require('dotenv').load()

const config = require('../config')
const fs = require('fs')
const merge = require('webpack-merge')
const path = require('path')
const portfinder = require('portfinder')
const utils = require('./utils')
const webpack = require('webpack')

const baseWebpackConfig = require('./webpack.base.conf')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ShopifySyncPlugin = require('./shopify-sync-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      extract: false,
      usePostCSS: true,
    }),
  },

  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/assets'),
    publicPath: config.dev.assetsPublicPath,
  },

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: { rewrites: [ { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') } ] },
    hot: true,
    contentBase: false,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: { poll: config.dev.poll },
    writeToDisk: true,
    disableHostCheck: true,
    // host: 'ezracelli-dev.myshopify.com',

    inline: true,
    progress: true,

    https: {
      key: fs.readFileSync(process.env.SSL_HTTPS_KEY),
      cert: fs.readFileSync(process.env.SSL_HTTPS_CERT),
      ca: fs.readFileSync(process.env.SSL_HTTPS_CA),
    },
  },
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env': require('../config/dev.env') }),
    new webpack.HotModuleReplacementPlugin(),
    // for shopify hot upload
    new HtmlWebpackPlugin({
      filename: '../layout/theme.liquid',
      template: 'theme.liquid',
      inject: false,
      devServer: false,
    }),
    // for local development
    new HtmlWebpackPlugin({
      filename: '../index.html',
      template: 'theme.liquid',
      inject: true,
      devServer: true,
    }),
    new ShopifySyncPlugin(),
    new WebpackCleanupPlugin({ exclude: [ 'config.yml' ] }),
  ],
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) reject(err)

    else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port

      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: { messages: [ `Your application is running here: http://${devWebpackConfig.devServer.host}:${port}` ] },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback()
          : undefined,
        clearConsole: false,
      }))

      devWebpackConfig.entry = {
        app: [
          // eslint-disable-next-line array-element-newline
          `webpack-dev-server/client?http://${devWebpackConfig.devServer.host}:${port}`,
          './src/main.js',
        ],
      }

      resolve(devWebpackConfig)
    }
  })
})
