<template>
  <div id="app">
    <!-- set progressbar -->
    <vue-progress-bar></vue-progress-bar>

    <the-header />

    <div class="content">
      <router-view/>
      <!-- <the-footer /> -->
    </div>
  </div>
</template>

<script>
import TheHeader from '@/components/TheHeader'
// import TheFooter from './components'

export default {
  name: 'App',
  components: { TheHeader },
  created () {
    this.$Progress.start()

    //  hook the progress bar to start before we move router-view
    this.$router.beforeEach((to, from, next) => {
      this.$Progress.start()
      next()
    })

    //  hook the progress bar to finish after we've finished moving router-view
    this.$router.afterEach((to, from) => {
      this.$Progress.finish()
    })
  },
}
</script>

<style lang="scss">
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  .content {
    margin-top: 100px;
    // transition: margin 0.2s;
  }

  // header.site-header.small~content {
  //   margin-top: 60px;
  // }
}
</style>
