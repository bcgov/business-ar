<script setup lang="ts">
const { t } = useI18n()
const routeWithoutLocale = useRouteWithoutLocale()
const localePath = useLocalePath()
const { locale } = useI18n()

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
  <div class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.missingId.h1') }}
    </h1>
    <UCard class="w-full max-w-lg">
      <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
    </UCard>
    <UButton label="use nano id" :to="localePath('/?nanoid=TIG9kz_ykKVo0FMQAH76o')" />
  </div>
</template>
