<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const busStore = useBusinessStore()
const localePath = useLocalePath()
const loadStore = useLoadingStore()
loadStore.pageLoading = true

useHead({
  title: t('page.submitted.title')
})

definePageMeta({
  middleware: ['filing-paid', 'require-account']
})

// TODO: need to handle if theres no filing id in the route query or if the put request fails
onBeforeMount(async () => {
  try {
    if (!route.query.filing_id) {
      throw new Error('Missing filing id in url.')
    } else {
      // check filing status details
      await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
      if (busStore.payStatus && busStore.payStatus !== 'PAID') {
        await navigateTo(localePath('/annual-report'))
      }
    }
  } catch (e) {
    // go back to ar page if no filing id or error in the PUT request
    console.error((e as Error).message)
    await navigateTo(localePath('/annual-report'))
  } finally {
    loadStore.pageLoading = false
  }
})
</script>
<template>
  <div v-show="!loadStore.pageLoading" class="mx-auto flex flex-col items-center justify-center gap-4 text-center">
    <ClientOnly>
      <h1 class="flex items-center gap-2 text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
        <span>{{ $t('page.submitted.h1') }}</span>
        <UIcon
          name="i-mdi-check-circle-outline"
          class="size-10 shrink-0 text-outcomes-approved"
        />
      </h1>
    </ClientOnly>
    <SbcNuxtContentCard id="submitted" />
  </div>
</template>
