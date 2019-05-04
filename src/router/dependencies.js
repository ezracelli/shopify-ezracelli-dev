import store from '../store'

const dependencies = {
  global () {
    return store.dispatch('initShopifyApp').then(() => {
      // store.dispatch('loadLogoSrc')
    })
  },
  home () {
    return Promise.all([
      store.dispatch('loadProducts'),
      // store.dispatch('loadCollects'),
      store.dispatch('loadBlogs').then(() =>
        store.dispatch('loadArticles')
      ),
      // store.dispatch('loadShop'),
    ])
  },
}

export default dependencies
