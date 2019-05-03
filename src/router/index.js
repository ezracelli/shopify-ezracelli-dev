import Vue from 'vue'
import Router from 'vue-router'
import dependencies from './dependencies'

import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HelloWorld,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const loadDependencies = dependencies[to.name] || Promise.resolve
  loadDependencies().then(next)
})

export default router
