<template>
  <PostQuery :defaults="defaults" />
</template>

<script setup lang="ts">
import PostQuery from '@/components/PostQuery.vue'

definePageMeta({
  layout: 'blog'
})

const { data: defaults } = await useFetch('/api/search', {
  transform: (ps) => ({
    count: ps.count,
    posts: ps.result
  })
})
</script>
