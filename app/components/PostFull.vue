<template>
  <section>
    <article class="card tw-mb-4">
      <div class="card-content">
        <PostHeader :post="post" />

        <div v-if="post.image" class="tw--mx-6 tw-mb-4">
          <img class="tw-w-full" :src="post.image" :alt="post.title" />
        </div>

        <h1 class="title">{{ post.title }}</h1>

        <div class="content" v-html="post.contentHtml" />

        <div class="tw-break-word">
          <span class="tw-mr-2">Tags:</span>
          <NuxtLink v-for="t in post.tag || []" :key="t" :to="`/tag/${t}`" class="tw-mr-2">{{ t }}</NuxtLink>
        </div>
      </div>
    </article>

    <footer v-if="hasComment" class="card tw-my-4">
      <div class="card-content">
        <div ref="remark42" />
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from '#imports'
import PostHeader from './PostHeader.vue'

import '~/app/utils/remark42'

const props = defineProps<{
  post: {
    title: string
    image?: string
    contentHtml: string
    tag?: string[]
    date?: string
  }
}>()

const route = useRoute()
const config = useRuntimeConfig()

const hasComment = !!config.public.remark42Config
const remark42 = ref<HTMLElement | null>(null)
let remark42Instance: any = null

const pageUrl = computed(() => config.public.baseUrl + route.path)

const initRemark42 = () => {
  if (process.client && config.public.remark42Config && window.REMARK42) {
    if (remark42Instance) {
      remark42Instance.destroy()
    }

    const remarkConfig: import('@/types/theme').IRemark42 = JSON.parse(
      config.public.remark42Config
    )

    remark42Instance = window.REMARK42.createInstance({
      node: remark42.value!,
      host: remarkConfig.host,
      site_id: remarkConfig.siteId
    })
  }
}

onMounted(() => {
  if (window.REMARK42) {
    initRemark42()
  } else {
    window.addEventListener('REMARK42::ready', initRemark42)
  }
})

onBeforeUnmount(() => {
  if (remark42Instance) {
    remark42Instance.destroy()
  }
})

watch(() => route.path, initRemark42)
</script>
