import Vue from 'vue'
import Vuex from 'vuex'
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
    { logoSrc: Symbol.for('default') },

    // map each item or item/subItem set to a state field
    ...items.map(item => ({ [item]: Symbol.for('default') })),
    ...subItems.map(([ item, subItem ]) => ({ [subItem]: new Proxy({}, proxyHandler) })),
  ),

  mutations: Object.assign(

    { setLogoSrc: (state, data) => Vue.set(state, 'logoSrc', data) },

    // map each item set to a setter
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

      loadLogoSrc (context) {
        if (context.getters.logoSrc !== Symbol.for('default')) return Promise.resolve()

        let url = `${shopifyAppHost}/api/themes/${shopifyThemeId}/assets`

        const query = {
          'asset[key]': 'assets/site-logo.jpg',
          'fields': 'public_url',
        }
        url += `?${querystring.stringify(query)}`

        return axios.get(url, { withCredentials: true }).then(({ data }) =>
          context.commit('setLogoSrc', data.asset.public_url)
        )
      },
    },

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
