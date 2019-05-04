<template>
  <header class="site-header" :class="{ small: atScrollTop }">
    <img :src="logoSrc" alt="Logo">
  </header>
</template>

<script>
import $ from 'jquery'

export default {
  name: 'TheHeader',
  data () {
    return { atScrollTop: false }
  },
  computed: {
    logoSrc () {
      const { logoSrc } = this.$store.getters
      return logoSrc === Symbol.for('default') ? '' : logoSrc
    },
  },
  created () {
    this.$store.dispatch('loadLogoSrc')

    $(window).on('scroll', () => {
      if (window.scrollY > 20) {
        if (!this.atScrollTop) this.atScrollTop = true
      } else this.atScrollTop = false
    })
  },
}
</script>

<style scoped lang="scss">
.site-header {
  @supports (position: sticky) {
    position: sticky;
  }

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
