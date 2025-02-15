<template>
  <div class="tw-inline-flex tw-justify-center tw-self-center">
    <a v-for="(username, platform) in social" :key="platform" class="navbar-item"
      :href="getSocialUrl(platform, username)" target="_blank" rel="noopener nofollow noreferrer">
      <span class="icon">
        <FontAwesome :icon="['fab', platform]" />
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const social = config.public.social ? JSON.parse(config.public.social) : {}

const getSocialUrl = (platform: string, username: string) => {
  const urls: Record<string, string> = {
    twitter: `https://twitter.com/${username}`,
    reddit: `https://www.reddit.com/user/${username}`,
    quora: `https://www.quora.com/profile/${username}`,
    github: `https://github.com/${username}`
  }
  return urls[platform] || '#'
}
</script>
