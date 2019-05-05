import Vue from 'vue'
import Vuex from 'vuex'

import { get } from 'lodash'
import axios from 'axios'
import querystring from 'querystring'

Vue.use(Vuex)

const {
  SHOPIFY_APP_HOST: shopifyAppHost,
  SHOPIFY_APP_SHOP: shopifyAppShop,
  SHOPIFY_THEME_ID: shopifyThemeId,
} = process.env

const items = [
  'products',
  'collects',
  'blogs',
  'shop',
]

const assets = [
  {
    folder: 'config',
    name: 'settingsData',
    filename: 'settings_data.json',
    search: { fields: [ 'value' ] },
    getValue: ({ value }) => JSON.parse(value),
  },
  // {
  //   folder: 'assets',
  //   name: 'logoSrc',
  //   filename: 'site-logo.jpg',
  //   search: { fields: [ 'public_url' ] },
  //   // eslint-disable-next-line camelcase
  //   getValue: ({ public_url }) => public_url,
  // },
]

const subItems = [ [ 'blogs', 'articles' ] ]

const capitalize = string => string.replace(/^./, m => m.toUpperCase())
const singlelize = string => string.replace(/s$/, '')

const proxyHandler = {
  get: (self, key) => {
    // ignore Vue-handled/hidden keys
    if (typeof key === 'symbol' || /^_/.test(key)) return self[key]

    // default state on access is Symbol.for('default')
    return self[key] || Symbol.for('default')
  },
  set: (self, key, value) => {
    // ignore Vue-handled/hidden keys
    if (typeof key === 'symbol' || /^_/.test(key)) self[key] = value

    // use Vue.set instead of assignment for reactive properties
    else Vue.set(self, key, value)
  },
}

const store = new Vuex.Store({

  // default state on access is Symbol.for('default')
  state: Object.assign(
    {
      logoSrc: get(window, [
        'shopify',
        'sections',
        'header',
        'logo',
      ], Symbol.for('default')),
    },

    // map each asset, item, or item/subItem set to a state field
    ...assets.map(({ name }) => ({ [name]: Symbol.for('default') })),
    ...items.map(item => ({ [item]: Symbol.for('default') })),
    ...subItems.map(([ item, subItem ]) => ({ [subItem]: new Proxy({}, proxyHandler) })),
  ),

  mutations: Object.assign(

    { setLogoSrc: (state, data) => Vue.set(state, 'logoSrc', data) },
    // map each asset to a setter
    ...assets.map(({ name }) => ({
      [`set${capitalize(name)}`] (state, data) {
        Vue.set(state, name, data)
      },
    })),

    // map each item to a setter
    ...items.map(item => ({
      [`set${capitalize(item)}`] (state, data) {
        Vue.set(state, item, data)
      },
    })),

    // map each item/subItem set to a setter
    ...subItems.map(([ item, subItem ]) => ({
      [`set${capitalize(subItem)}`] (state, { itemId, data }) {
        Vue.set(state[subItem], itemId, data)
      },
    })),

  ),

  actions: Object.assign(

    {
      // get Shopify API access key
      initShopifyApp (context) {
        return axios
          .get(`${shopifyAppHost}/shopify?shop=${shopifyAppShop}.myshopify.com`)
      },
    },

    ...assets.map(({
      folder, name, filename,
      search = {},
      getValue = data => data,
    }) => ({
      [`load${capitalize(name)}`] (context) {
        if (context.getters[name] !== Symbol.for('default')) return Promise.resolve()

        let url = `${shopifyAppHost}/api/themes/${shopifyThemeId}/assets`

        if (search.fields) search.fields = search.fields.join(',')

        const query = {
          'asset[key]': `${folder}/${filename}`,
          ...search,
        }

        url += `?${querystring.stringify(query)}`

        return axios.get(url, { withCredentials: true }).then(({ data }) => {
          context.commit(`set${capitalize(name)}`, getValue(data.asset))
        })
      },
    })),

    // map each item to a loader at that item's endpoint
    ...items.map(item => ({
      [`load${capitalize(item)}`] (context) {
        if (context.getters[item] !== Symbol.for('default')) return Promise.resolve()

        return axios
          .get(`${shopifyAppHost}/api/${item}`, { withCredentials: true })
          .then(({ data }) => context.commit(`set${capitalize(item)}`, data[item]))
      },
    })),

    // map each item/subItem set to a loader at that item/subItem set's endpoint
    ...subItems.map(([ item, subItem ]) => ({
      [`load${capitalize(subItem)}`] (context, itemIds) {
        if (!itemIds) itemIds = context.getters[`${singlelize(item)}Ids`]

        // remove already-loaded items from itemIds to load
        const getter = `${subItem}For${capitalize(singlelize(item))}`
        itemIds = itemIds.filter(itemId => {
          const subItemForItem = context.getters[getter](itemId)
          return subItemForItem === Symbol.for('default')
        })

        return Promise.all(
          itemIds.map(itemId =>
            axios
              .get(`${shopifyAppHost}/api/${item}/${itemId}/${subItem}`, { withCredentials: true })
              .then(({ data }) => {
                context.commit(`set${capitalize(subItem)}`, { itemId, data: data[subItem] })
              })
          )
        )
      },
    })),

  ),
  getters: Object.assign(
    { logoSrc: state => state.logoSrc },

    ...assets.map(({ name }) => ({ [name]: state => state[name] })),

    // map each item set to a getter
    ...items.map(item => ({

      // get all items in state
      [item]: state => state[item],

      // get all itemIds
      [`${singlelize(item)}Ids`]: state => {
        if (!Array.isArray(state[item])) return []
        return state[item].map(({ id }) => id)
      },

    })),

    // map each item/subItem set to a getter
    ...subItems.map(([ item, subItem ]) => ({

      // get all subItems in state
      [subItem]: state => Object.values(state[subItem]).flat(),

      // get all subItems for one item
      [`${subItem}For${capitalize(singlelize(item))}`]: state => itemId => state[subItem][itemId],

    }))

  ),
})

export default store
