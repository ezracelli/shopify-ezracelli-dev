<template>
  <div>
    <h1>Articles By Blog</h1>

    <div v-for="blog in blogs" :key="blog.id">
      <h2>{{ blog.title }}</h2>
      <hr>
      <div v-for="article in articlesForBlog(blog.id)" :key="article.id">
        <h3>{{ article.title }}</h3>
        <div><small>
          {{ $moment(article.published_at).format('MM/DD/YYYY [at] h:mm A') }}
          by
          {{ article.author }}
        </small></div>
        {{ article.body_html }}
      </div>
    </div>

    <hr>

    <h1>Products</h1>

    <div class="products-container">
      <div v-for="product in products" :key="product.id" class="product-wrapper">
        <h3>{{ product.title }}</h3>
        <img :src="product.image.src | imgUrl('medium')" :alt="product.title">
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HelloWorld',
  data () {
    return {}
  },
  computed: mapGetters([
    'blogs',
    'articlesForBlog',
    'products',
  ]),
  filters: {
    imgUrl (imgUrl, size) {
      return imgUrl.replace(/\.(jpg|jpeg|png|gif)/, `_${size}$&`)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.products-container {
  display: flex;
  flex-wrap: wrap;

  .product-wrapper {
    flex: 0 0 50%;
    max-width: 50%;
    position: relative;
    width: 100%;
  }
}
</style>
