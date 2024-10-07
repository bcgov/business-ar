<script setup lang="ts">
const submittedSuccessText = inject<Record<string, any>>('sbc-bar-success-text')
const submittedPlatformInfo = inject<Record<string, any>>('sbc-bar-platform-info')
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
    const errorMessage = (e as Error).message
    if (!errorMessage.includes('Annual Report not due until')) {
      console.error(errorMessage)
      return navigateTo(localePath('/annual-report'))
    }
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
  busStore.payStatus = null
  await nextTick()
  return navigateTo(localePath('/annual-report'))
}

// Compute whether there are more reports
const isMoreReports = () => {
  const dueDates = busStore.getArDueDates()
  return dueDates && dueDates.length > 0
}

if (import.meta.client) {
  initPage()
}
</script>

<template>
  <client-only>
    <div v-show="!pageLoading" class="mx-auto flex flex-col items-center justify-center gap-4 text-center sm:w-4/5 xl:w-3/5">
      <SbcPageSectionH1 class="mb-2 mt-3 flex items-center">
        <span>{{ $t('page.submitted.h1', { year: lastARDate!.getFullYear() }) }}</span>
        <UIcon name="i-mdi-check-circle-outline" class="size-10 shrink-0 text-outcomes-approved" />
      </SbcPageSectionH1>

      <SbcAlert :show-on-category="[AlertCategory.INTERNAL_SERVER_ERROR, AlertCategory.DOCUMENT_DOWNLOAD]" />

      <SbcNuxtContentCard id="submitted-success-text" route-suffix="/success-text" :content="submittedSuccessText" />

      <UCard v-show="isMoreReports()" class="w-full" data-testid="bus-details-card">
        <SbcFileAnotherReport
          :items="[
            { label: $t('labels.busName'), value: busStore.businessNano.legalName },
            { label: $t('labels.corpNum'), value: `${busStore.businessNano.legalType}${busStore.businessNano.identifier.replace(/\D/g, '')}`},
            { label: $t('labels.busNum'), value: busStore.businessNano.taxId ? `${busStore.businessNano.taxId.slice(0, 9)} ${busStore.businessNano.taxId.slice(9)}` : null },
          ]"
          :last-a-r-completed-year="lastARDate!.getFullYear()"
          :next-a-r-year="busStore.nextArYear"
          :ar-due-dates="busStore.getArDueDates()"
          @file-next-report="handleFileNextReport"
        />
      </UCard>

      <!-- Render platform info -->
      <SbcNuxtContentCard id="submitted-platform-info" route-suffix="/platform-info" :content="submittedPlatformInfo" />
    </div>
  </client-only>
</template>
