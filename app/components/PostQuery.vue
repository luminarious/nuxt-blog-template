<template>
  <section>
    <header v-if="tag" class="tw-mx-4 tw-mb-4">
      <h1 class="title is-2">Tag: {{ tag }}</h1>
    </header>

    <article v-if="!isReady || posts.length > 0">
      <div v-for="p in posts" :key="p.path" class="tw-mb-4">
        <PostTeaser :post="p" />
      </div>

      <Pagination v-if="pageTotal > 1" :total="pageTotal" />
    </article>
    <Empty v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { normalizeArray } from '~/app/utils/util'

import Empty from './Empty.vue'
import Pagination from './Pagination.vue'
import PostTeaser from './PostTeaser.vue'

const props = defineProps<{
  defaults: {
    count: number
    posts: any[]
  }
}>()

const route = useRoute()
const router = useRouter()

const count = ref(props.defaults.count)
const posts = ref<any[]>(props.defaults.posts)
const isReady = ref(false)

const pageTotal = computed(() => Math.ceil(count.value / 5))
const tag = computed(() => route.params.tag)
const page = computed(() => parseInt(route.params.page || '1'))
const q = computed(() => {
  try {
    return normalizeArray(route.query.q) || ''
  } catch (_) {
    return ''
  }
})

const updatePosts = async () => {
  isReady.value = false

  if (q.value && !tag.value) {
    const ps = await $fetch('/.netlify/functions/search', {
      params: {
        q: q.value,
        offset: (page.value - 1) * 5,
        tag: tag.value
      }
    })
    count.value = ps.count
    posts.value = ps.result
  } else {
    count.value = props.defaults.count
    posts.value = props.defaults.posts
  }

  isReady.value = true
}

// Fetch posts when `page`, `tag`, or `q` changes
watchEffect(updatePosts)

// Handle query changes
watchEffect(() => {
  if (q.value) {
    router.push({
      path: '/blog',
      query: { q: q.value }
    })
  }
})
</script>
