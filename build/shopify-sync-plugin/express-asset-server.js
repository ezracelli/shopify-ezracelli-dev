// const config = require('../../config')
const cors = require('cors')
const express = require('express')
// const webpackDevMiddleware = require('webpack-dev-middleware')
// const webpackHotMiddleware = require('webpack-hot-middleware')

module.exports = class ExpressAssetServer {
  constructor ({ compiler, isHotUpdateFile }) {
    const app = express()

    // app.webpackDevMiddleware = webpackDevMiddleware(compiler, {
    //   logLevel: 'silent',
    //   reload: true,
    //   publicPath: config.dev.assetsPublicPath,
    //   writeToDisk: (filePath) => !isHotUpdateFile(filePath),
    // })
    // app.webpackHotMiddleware = webpackHotMiddleware(compiler, {
    //   log: false,
    //   publicPath: config.dev.assetsPublicPath,
    // })

    app.use(cors())

    // app.use(app.webpackDevMiddleware)
    // app.use(app.webpackHotMiddleware)

    return app
  }
}
