<template>
  <section class="tw-my-4 tw-mx-2">
    <nav class="pagination is-rounded" role="navigation" aria-label="pagination">
      <NuxtLink v-if="page > 1" :to="setPageUrl(page - 1)" class="pagination-previous">
        <span class="icon">
          <FontAwesome icon="caret-left" />
        </span>
        <span class="tw-sr-only">Previous</span>
      </NuxtLink>

      <NuxtLink v-if="page < total - 1" :to="setPageUrl(page + 1)" class="pagination-next">
        <span class="icon">
          <FontAwesome icon="caret-right" />
        </span>
        <span class="tw-sr-only">Next</span>
      </NuxtLink>

      <ul class="pagination-list">
        <li v-if="page > 1">
          <NuxtLink :to="setPageUrl(1)" class="pagination-link" aria-label="go to page 1">
            1
          </NuxtLink>
        </li>

        <li v-if="page > 3">
          <span class="pagination-ellipsis">&hellip;</span>
        </li>

        <li v-if="page > 2">
          <NuxtLink :to="setPageUrl(page - 1)" class="pagination-link" :aria-label="`go to page ${page - 1}`">
            {{ page - 1 }}
          </NuxtLink>
        </li>

        <li>
          <NuxtLink :to="setPageUrl(page)" class="pagination-link is-current" :aria-label="`go to page ${page}`"
            aria-current="page">
            {{ page }}
          </NuxtLink>
        </li>

        <li v-if="page < total - 1">
          <NuxtLink :to="setPageUrl(page + 1)" class="pagination-link" :aria-label="`go to page ${page + 1}`">
            {{ page + 1 }}
          </NuxtLink>
        </li>

        <li v-if="page < total - 2">
          <span class="pagination-ellipsis">&hellip;</span>
        </li>

        <li v-if="page < total">
          <NuxtLink :to="setPageUrl(total)" class="pagination-link" :aria-label="`go to page ${total}`">
            {{ total }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  total: number
}>()

const route = useRoute()
const router = useRouter()

const page = computed(() => {
  const match = route.path.match(/\/(\d+)?$/)
  return match && match[1] ? parseInt(match[1]) : 1
})

const setPageUrl = (p: number) => {
  const { path, query } = route
  const path0 = path.replace(/\/(\d+)?$/, '')

  return router.resolve({
    path: `${path0 || '/blog'}${p === 1 ? '' : `/${p}`}`,
    query
  }).href
}
</script>
