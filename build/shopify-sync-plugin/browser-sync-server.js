const browserSync = require('browser-sync')
const chalk = require('chalk')
const config = require('../../config')
const figures = require('figures')

const {
  HOST,
  PORT,
  SLATE_STORE,
  SLATE_THEME_ID,
  SSL_HTTPS_CERT,
  SSL_HTTPS_KEY,
} = process.env

class BrowserSyncServer {
  constructor () {
    this.bs = browserSync.create()
    this.alreadyStarted = false

    this.port = PORT || config.dev.port
    this.target = `https://${SLATE_STORE}?preview_theme_id=${SLATE_THEME_ID}`
  }

  start () {
    if (this.alreadyStarted) return

    const domain = `https://${HOST}:${this.port}`

    const bsConfig = {
      port: this.port,
      proxy: {
        target: this.target,
        middleware: (req, res, next) => {
          // Shopify sites with redirection enabled for custom domains force redirection
          // to that domain. `?_fd=0` prevents that forwarding.
          // ?pb=0 hides the Shopify preview bar
          const prefix = req.url.indexOf('?') > -1 ? '&' : '?'
          const queryStringComponents = [ '_fd=0&pb=0' ]

          req.url += prefix + queryStringComponents.join('&')
          next()
        },
      },
      https: { key: SSL_HTTPS_KEY, cert: SSL_HTTPS_CERT },
      logLevel: 'silent',
      socket: { domain },
      ui: false,
    }

    this.alreadyStarted = true

    return new Promise((resolve) => {
      this.bs.init(bsConfig, server => {
        console.log(`\n${chalk.green(figures.tick)} BrowserSync started on port ${this.port}!`)
        resolve()
      })
    })
  }
}

module.exports = new BrowserSyncServer()
