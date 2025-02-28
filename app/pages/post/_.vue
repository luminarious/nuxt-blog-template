<template>
  <PostFull v-if="post" :post="post" />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig } from '#imports'
import { useSeoMeta } from '#imports'
import PostFull from '@/components/PostFull.vue'

definePageMeta({
  layout: 'blog'
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const { data: post, error } = await useFetch('/api/post', {
  params: { path: route.params.pathMatch },
  transform: (data) => ({
    title: data.title,
    image: data.image,
    tag: data.tag,
    excerpt: data.excerpt,
    contentHtml: data.contentHtml,
    date: data.date
  })
})

// Redirect to 404 if the post is not found
if (error.value) {
  router.push({ path: '/404' })
}

// SEO Meta Tags
useSeoMeta({
  title: () => post.value ? `${post.value.title} - ${config.public.title}` : '',
  description: () => post.value?.excerpt || '',
  ogTitle: () => post.value?.title,
  ogDescription: () => post.value?.excerpt,
  ogImage: () => post.value?.image,
  twitterTitle: () => post.value?.title,
  twitterDescription: () => post.value?.excerpt,
  twitterImage: () => post.value?.image
})
</script>
