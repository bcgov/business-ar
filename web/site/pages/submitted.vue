<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const busStore = useBusinessStore()
const routeWithoutLocale = useRouteWithoutLocale()

useHead({
  title: t('page.submitted.title')
})

const { data } = await useAsyncData('content-data-submitted', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
})

onMounted(async () => {
  try {
    if (!route.query.filing_id) {
      // do something
    } else if (busStore.payStatus === null || busStore.payStatus === '') {
      // only make request if pay status doesnt already exist
      await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
    } else {
      // do something
    }
  } catch (e) {
    console.error(e)
  }
})
</script>
<template>
  <SbcLoadingSpinner v-if="busStore.loading" />
  <div v-else class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="flex items-center gap-2 text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      <span>{{ $t('page.submitted.h1') }}</span>
      <UIcon
        name="i-mdi-check-circle-outline"
        class="size-10 shrink-0 text-outcomes-approved"
      />
    </h1>
    payment status: {{ busStore.payStatus }}
    <UCard class="w-full">
      <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
      <!-- <ContentDoc
        :query="{
          path: routeWithoutLocale,
          where: { _locale: $i18n.locale }
        }"
        class="prose prose-bcGov text-left"
      /> -->
    </UCard>
  </div>
</template>
