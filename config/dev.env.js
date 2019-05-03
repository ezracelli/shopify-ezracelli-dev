'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SHOPIFY_APP_HOST: '"https://mighty-castle-29807.herokuapp.com"',
  SHOPIFY_APP_SHOP: '"ezracelli-dev"',
  SHOPIFY_THEME_ID: '72508506189',
})
