<template>
  <div id="app">
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
