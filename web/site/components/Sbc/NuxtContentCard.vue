<script setup lang="ts">
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
  }
})

const fullId = 'content-data-' + props.id

const { data } = await useAsyncData(fullId, () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value + props.routeSuffix } })
    .findOne()
})
</script>
<template>
  <UCard class="w-full" :data-testid="fullId">
    <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
  </UCard>
</template>
