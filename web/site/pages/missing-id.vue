<script setup lang="ts">
const { t } = useI18n()
const routeWithoutLocale = useRouteWithoutLocale()
const localePath = useLocalePath()
const { locale } = useI18n()
const nanoid = ref('')

useHead({
  title: t('page.missingId.title')
})

definePageMeta({
  order: 0
})

// explicitly calling this instead of using <ContentDoc /> as its unreliable for pnpm generate
const { data } = await useAsyncData('content-data-missing-id', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
})
</script>
<template>
  <div class="mx-auto flex flex-col items-center justify-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.missingId.h1') }}
    </h1>
    <UCard class="w-full max-w-lg" data-testid="content-data-missing-id">
      <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
    </UCard>
    <!-- this is only for dev to enter nano ids -->
    <div class="flex gap-2">
      <UInput v-model="nanoid" placeholder="Enter a nano id" variant="bcGov" />
      <UButton label="Go" :to="localePath(`/?nanoid=${nanoid}`)" />
    </div>
  </div>
</template>
