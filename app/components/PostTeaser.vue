<template>
  <section class="card">
    <article class="card-content">
      <PostHeader :post="post" />

      <div class="post-content">
        <div v-if="post.image" class="image-teaser">
          <img :src="post.image" :alt="post.title" />
        </div>

        <NuxtLink :to="url">
          <h2 class="title tw-mb-6 header-link">{{ post.title }}</h2>
        </NuxtLink>

        <div class="content" v-html="post.excerptHtml" />
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PostHeader from './PostHeader.vue'

const props = defineProps<{
  post: {
    title: string
    path: string
    image?: string
    excerptHtml: string
  }
}>()

const url = computed(() => `/post/${props.post.path}`)
</script>

<style scoped>
.content {
  width: 100%;
  margin: 0;
  max-width: 80vw;
}

.card-content {
  overflow: hidden;
}

.header-link:hover {
  color: rgb(0, 160, 255);
}

.image-teaser {
  width: calc(100% + 3rem);
  margin: 1rem -1.5rem;
}

.image-teaser img {
  width: 100%;
}

.post-content {
  width: 100%;
  overflow: visible;
}

@media only screen and (min-width: 800px) {
  .image-teaser {
    width: 100%;
    max-width: 300px;
    max-height: 300px;
    float: right;
    margin-left: 1rem;
    margin-right: 0;
    margin-top: 0;
  }
}
</style>
