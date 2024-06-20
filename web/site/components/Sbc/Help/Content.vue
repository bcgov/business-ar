<script setup lang="ts">
const { locale } = useI18n()

const { data: helpDocs } = await useAsyncData('help-docs-fetch', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: '/help' } })
    .findOne()
})
</script>
<template>
  <ContentRenderer :value="helpDocs" class="prose prose-bcGov prose-h2:mt-4 prose-h2:mb-2 min-w-full break-words text-left leading-snug" />
</template>
