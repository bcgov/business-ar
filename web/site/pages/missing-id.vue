<script setup lang="ts">
const { t } = useI18n()
const routeWithoutLocale = useRouteWithoutLocale()
useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})
</script>
<template>
  <div class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      Authorization Required
    </h1>
    <UCard class="w-full max-w-lg">
      <ContentDoc
        :query="{
          path: routeWithoutLocale,
          where: { _locale: $i18n.locale }
        }"
        class="prose prose-bcGov text-left"
      />
    </UCard>
    <UButton label="use nano id" to="http://localhost:3000/en-CA?nanoid=TIG9kz_ykKVo0FMQAH76o" />
  </div>
</template>
