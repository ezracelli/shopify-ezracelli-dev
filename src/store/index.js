import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import querystring from 'querystring'

window.querystring = querystring

Vue.use(Vuex)

// environment variables
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

const store = new Vuex.Store({
  state: Object.assign(
    { logoSrc: '' },
    ...items.map(item => ({ [item]: Symbol.for('default') })),
    ...subItems.map(([ item, subItem ]) => ({ [subItem]: Symbol.for('default') }))
  ),
  mutations: Object.assign(
    { setLogoSrc: (state, data) => Vue.set(state, 'logoSrc', data) },
    ...items.map(item => ({
      [`set${capitalize(item)}`] (state, data) {
        Vue.set(state, item, data)
      },
    })),
    ...subItems.map(([ item, subItem ]) => ({
      [`set${capitalize(subItem)}`] (state, { itemId, data }) {
        if (state[subItem] === Symbol.for('default')) Vue.set(state, subItem, {})
        Vue.set(state[subItem], itemId, data)
      },
    })),
  ),
  actions: Object.assign(
    {
      initShopifyApp (context) {
        return axios
          .get(`${shopifyAppHost}/shopify?shop=${shopifyAppShop}.myshopify.com`)
      },
      loadLogoSrc (context) {
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
    ...items.map(item => ({
      [`load${capitalize(item)}`] (context) {
        return axios
          .get(`${shopifyAppHost}/api/${item}`, { withCredentials: true })
          .then(({ data }) => context.commit(`set${capitalize(item)}`, data[item]))
      },
    })),
    ...subItems.map(([ item, subItem ]) => ({
      [`load${capitalize(subItem)}`] (context, itemIds) {
        if (!itemIds) itemIds = context.getters[`${singlelize(item)}Ids`]
        if (!itemIds.length) return Promise.resolve()

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
    ...items.map(item => ({ [item]: state => state[item] })),
    ...subItems.map(([ item, subItem ]) => ({
      [subItem]: state => Object.values(state[subItem]).flat(),
      [`${subItem}For${capitalize(singlelize(item))}`]: state => itemId => state[subItem][itemId],
      [`${singlelize(item)}Ids`]: state => {
        if (!Array.isArray(state[item])) return []
        return state[item].map(({ id }) => id)
      },
    }))
  ),
})

export default store
