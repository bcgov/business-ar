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

async function initPage () {
  try {
    if (!route.query.filing_id) {
      throw new Error('Missing filing id in url.')
    } else {
      // check filing status details
      await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
      if (busStore.payStatus && busStore.payStatus !== 'PAID') {
        return navigateTo(localePath('/annual-report'))
      }
      loadStore.pageLoading = false
    }
  } catch (e) {
    // go back to ar page if no filing id or error in the PUT request
    console.error((e as Error).message)
    return navigateTo(localePath('/annual-report'))
  }
}

if (import.meta.client) {
  initPage()
}
</script>
<template>
  <div v-show="!loadStore.pageLoading" class="mx-auto flex flex-col items-center justify-center gap-4 text-center">
    <SbcPageSectionH1 class="flex items-center gap-2">
      <span>{{ $t('page.submitted.h1') }}</span>
      <UIcon
        name="i-mdi-check-circle-outline"
        class="size-10 shrink-0 text-outcomes-approved"
      />
    </SbcPageSectionH1>
    <SbcNuxtContentCard id="submitted" />
  </div>
</template>
