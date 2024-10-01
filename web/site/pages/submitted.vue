<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const localePath = useLocalePath()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.submitted.title')
})

definePageMeta({
  middleware: ['require-account']
})

async function initPage () {
  try {
    if (!route.query.filing_id) {
      throw new Error('Missing filing id in url.')
    } else {
      // check filing status details
      if (!busStore.payStatus || busStore.payStatus !== 'PAID') {
        await busStore.updatePaymentStatusForBusiness(route.query.filing_id as string)
      }

      if (busStore.payStatus !== 'PAID') {
        return navigateTo(localePath('/annual-report'))
      }

      // Filing was successful, load the next AR
      await busStore.getBusinessTask()
    }
  } catch (e) {
    // go back to ar page if no filing id or error in the PUT request
    console.error((e as Error).message)
    return navigateTo(localePath('/annual-report'))
  } finally {
    pageLoading.value = false
  }
}

// Compute latest last AR date as a date
const lastARDate = computed(() => {
  if (busStore.lastArDate) {
    return new Date(busStore.lastArDate)
  }
  return null
})

// Reset store and navigate back to filing page
const handleFileNextReport = async () => {
  arStore.$reset()
  await nextTick()
  return navigateTo(localePath('/annual-report'))
}

if (import.meta.client) {
  initPage()
}
</script>

<template>
  <client-only>
    <div v-if="!pageLoading && !deepEqual(busStore.businessNano, {})" class="mx-auto flex w-2/3 flex-col items-center justify-center gap-4 text-center">
      <SbcPageSectionH1 class="mb-2 mt-3 flex items-center">
        <span>{{ lastARDate!.getFullYear() }} {{ $t('page.submitted.h1') }}</span>
        <UIcon name="i-mdi-check-circle-outline" class="size-10 shrink-0 text-outcomes-approved" />
      </SbcPageSectionH1>

      <SbcAlert :show-on-category="[AlertCategory.INTERNAL_SERVER_ERROR, AlertCategory.DOCUMENT_DOWNLOAD]" />

      <SbcNuxtContentCard id="submitted-success-text" route-suffix="/success-text" />

      <UCard class="w-full" data-testid="bus-details-card">
        <SbcFileAnotherReport
          :last-a-r-completed-year="lastARDate!.getFullYear()"
          :next-a-r-year="busStore.nextArYear"
          :ar-due-dates="busStore.getArDueDates()"
          @file-next-report="handleFileNextReport"
        />
      </UCard>

      <!-- Render platform info -->
      <SbcNuxtContentCard id="submitted-platform-info" route-suffix="/platform-info" />
    </div>
  </client-only>
</template>
