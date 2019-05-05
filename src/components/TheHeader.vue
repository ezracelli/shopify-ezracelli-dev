<template>
  <header class="site-header" :class="{ small: hasScrolled }">
    <img v-show="logoSrc" :src="logoSrc" alt="Logo">
  </header>
</template>

<script>
import $ from 'jquery'

export default {
  name: 'TheHeader',
  data () {
    return { hasScrolled: false }
  },
  computed: {
    logoSrc () {
      const { logoSrc } = this.$store.getters
      return logoSrc === Symbol.for('default') ? '' : logoSrc
    },
  },
  created () {
    // this.$store.dispatch('loadLogoSrc')

    $(window).on('scroll', () => {
      if (window.scrollY > 30) {
        if (!this.hasScrolled) this.hasScrolled = true
      } else {
        this.hasScrolled = false
      }
    })
  },
}
</script>

<style scoped lang="scss">
.site-header {
  // @supports (position: sticky) {
  //   position: sticky;
  // }

  background-color: white;
  border-bottom: 1px solid black;
  height: 100px;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: height 0.2s;

  &.small {
    height: 60px;
  }

  img {
    height: 100%;
  }
}
</style>
