import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'concat',
      component: require('@/components/Concat').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
