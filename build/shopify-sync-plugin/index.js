require('dotenv').load()

const { createServer } = require('https')
const { upload } = require('../slate-sync')
const { SyncHook, AsyncSeriesHook } = require('tapable')
const ExpressAssetServer = require('./express-asset-server')
// const BrowserSyncServer = require('./browser-sync-server')
const chalk = require('chalk')
const config = require('../../config')
const createHash = require('crypto').createHash
const figures = require('figures')
const fs = require('fs')
const path = require('path')
const portfinder = require('portfinder')

class Client {
  constructor () {
    this.files = []
    this.hooks = {
      syncDone: new SyncHook([ 'files', 'stats' ]),
      afterSync: new AsyncSeriesHook([ 'files', 'stats' ]),
    }
  }

  async sync (files, stats) {
    this.files = files

    if (this.files.length > 0) {
      await upload(this.files)
      this.hooks.syncDone.call(this.files, stats)
    }

    this.hooks.afterSync.promise(this.files, stats)
  }
}

class ShopifySync {
  constructor (compiler) {
    // watch for shopify upload

    this.assetHashes = {}
    this.client = new Client()

    // bind lifecycle hooks

    compiler.hooks.done.tapPromise(
      'ShopifySyncPlugin',
      this._onCompileDone.bind(this),
    )

    // this.client.hooks.afterSync.tap(
    //   'HotMiddleWare',
    //   this._onAfterSync.bind(this),
    // )

    // create asset server

    // console.log(compiler.outputPath)

    // this.app = new ExpressAssetServer({
    //   compiler,
    //   isHotUpdateFie: this._isHotUpdateFile,
    // })

    // const https = {
    //   key: fs.readFileSync(process.env.SSL_HTTPS_KEY),
    //   cert: fs.readFileSync(process.env.SSL_HTTPS_CERT),
    // }

    // this.server = createServer(https, this.app)

    // portfinder.basePort = +(process.env.PORT || config.dev.port) + 1
    // portfinder.getPort((err, port) => {
    //   if (err) return console.log(`\n${chalk.red(figures.cross)} Error finding port for local asset server`)
    //   this.server.listen(port)
    // })
  }

  set files (files) {
    this.client.files = files
  }

  _onCompileDone (stats) {
    const files = this._getAssetsToUpload(stats)
    console.log(files)
    return this.client.sync(files, stats)
  }

  _onAfterSync (files) {
    this.app.webpackHotMiddleware.publish({
      action: 'shopify_upload_finished',
      force: files.length > 0,
    })
  }

  _hasAssetChanged (key, asset) {
    const oldHash = this.assetHashes[key]
    const newHash = this._updateAssetHash(key, asset)

    return oldHash !== newHash
  }

  _isHotUpdateFile (key) {
    return /\.hot-update\.json$/.test(key) || /\.hot-update\.js$/.test(key)
  }

  _getAssetsToUpload (stats) {
    const assets = Object.entries(stats.compilation.assets)
    const dir = path.join(process.cwd(), 'dist')

    return (
      assets
        .filter(([ key, asset ]) => (
          asset.emitted &&
          !this._isHotUpdateFile(key) &&
          this._hasAssetChanged(key, asset)
        ))
        .map(([ key, asset ]) => asset.existsAt.replace(dir, ''))
    )
  }

  _updateAssetHash (key, asset) {
    const rawSource = asset.source()
    const source = Array.isArray(rawSource) ? rawSource.join('\n') : rawSource
    const hash = createHash('sha256')
      .update(source)
      .digest('hex')

    return (this.assetHashes[key] = hash)
  }
}

class ShopifySyncPlugin {
  apply (compiler) {
    const assetServer = new ShopifySync(compiler)

    assetServer.client.hooks.syncDone.tap('Client', () => {
      console.log(`\n${chalk.green(figures.tick)}  Files uploaded successfully!\n`)
      // BrowserSyncServer.start()
    })
  }
}

module.exports = ShopifySyncPlugin
