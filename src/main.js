// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import dependencies from './router/dependencies'
import store from './store'
import moment from 'moment'

import VueProgressBar from 'vue-progressbar'

Vue.config.productionTip = false

Vue.use(VueProgressBar, { autoFinish: false })
Vue.prototype.$moment = moment

dependencies.global().then(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
  })
})
