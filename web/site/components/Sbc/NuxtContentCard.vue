<script setup lang="ts">
// simplify displaying nuxt content, dont need to call useAsyncData + query content each time
// matches whatever the current route and locale are where the component is mounted
// must use v-show if conditionally rendering content, wont be prerendered with v-if
const { locale } = useI18n()
const routeWithoutLocale = useRouteWithoutLocale()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  routeSuffix: {
    type: String,
    default: ''
  },
  content: {
    type: Object,
    default: null
  }
})

const fullId = 'content-data-' + props.id

// Fetch the content data based on the current locale and route
const fetchData = async () => {
  if (props.content) {
    return props.content
  }
  return await queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value + props.routeSuffix } })
    .findOne()
}

const { data, refresh } = await useAsyncData(fullId, fetchData)
let debounceTimer: NodeJS.Timeout | null = null
watch([locale, routeWithoutLocale], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    refresh()
  }, 500)
})

</script>
<template>
  <UCard class="w-full" :data-testid="fullId">
    <ContentRenderer v-if="data" :value="data" class="prose prose-bcGov w-full max-w-none text-left text-black" />
    <div v-else class="text-center">
      <UIcon name="i-mdi-loading" class="animate-spin" />
    </div>
  </UCard>
</template>
