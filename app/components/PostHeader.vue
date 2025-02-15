<template>
  <section class="tw-mb-4">
    <a class="el-author" :href="author.url" target="_blank" rel="noreferrer noopener nofollow">
      <span class="image">
        <img class="is-rounded" :src="authorImage" :alt="author.name" />
      </span>
      <span>{{ author.name }}</span>
    </a>

    <div class="tw-flex-grow" />

    <div>{{ dateString }}</div>
  </section>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { getGravatarUrl } from '../app/assets/gravatar'

const props = defineProps<{
  post: {
    date?: string
  }
}>()

const config = useRuntimeConfig()
const author = JSON.parse(config.public.author || '{}')

const authorImage = computed(() =>
  author.image ? author.image : getGravatarUrl(author.email, 64)
)

const dateString = computed(() => {
  const m = props.post.date ? dayjs(props.post.date) : null
  return m ? m.format('ddd D MMMM YYYY') : ''
})
</script>

<style scoped>
section:first-child {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  overflow: auto;
}

.el-author {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  justify-content: center;
}

.el-author img {
  border: none;
  display: block;
  width: 24px;
  min-width: 24px;
}

.el-author span+span {
  margin-left: 0.5rem;
}
</style>
