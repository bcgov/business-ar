<script setup lang="ts">
import { onMounted } from 'vue'
const { t } = useI18n()
const route = useRoute()
const busStore = useBusinessStore()
const routeWithoutLocale = useRouteWithoutLocale()

useHead({
  title: t('page.home.title')
})

onMounted(async () => {
  try {
    if (!route.query.filing_id) {
      // do something
    } else {
      // await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
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
      <span>Annual Report Filed</span>
      <UIcon
        name="i-mdi-check-circle-outline"
        class="size-10 shrink-0 text-outcomes-approved"
      />
    </h1>
    payment status: {{ busStore.payStatus }}
    <UCard class="w-full">
      <ContentDoc
        :query="{
          path: routeWithoutLocale,
          where: { _locale: $i18n.locale }
        }"
        class="prose prose-bcGov text-left"
      />
    </UCard>
  </div>
</template>
