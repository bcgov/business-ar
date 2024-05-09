<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const busStore = useBusinessStore()
const routeWithoutLocale = useRouteWithoutLocale()
const localePath = useLocalePath()
const loading = ref(true)

useHead({
  title: t('page.submitted.title')
})

// explicitly calling this instead of using <ContentDoc /> as its unreliable for pnpm generate
const { data } = await useAsyncData('content-data-submitted', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
})

// TODO: need to handle if theres no filing id in the route query or if the put request fails
onMounted(async () => {
  try {
    if (!route.query.filing_id) {
    // do something if no filing id
    } else {
      // check filing status details
      await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
      if (busStore.payStatus && busStore.payStatus !== 'PAID') {
        await navigateTo(localePath('/annual-report'))
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <SbcLoadingSpinner v-if="loading" overlay />
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
    </UCard>
  </div>
</template>
