<template>
  <PostQuery :defaults="defaults" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PostQuery from '@/components/PostQuery.vue'

definePageMeta({
  layout: 'blog'
})

const route = useRoute()

const page = computed(() => parseInt(route.params.page) || 1)
const tag = computed(() => route.params.tag)

const { data: defaults } = await useFetch('/api/search', {
  params: {
    tag: tag.value,
    offset: (page.value - 1) * 5
  },
  transform: (ps) => ({
    count: ps.count,
    posts: ps.result
  })
})
</script>
