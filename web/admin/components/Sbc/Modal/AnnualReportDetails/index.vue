<script setup lang="ts">
const { t } = useI18n()
const isSmallScreen = useMediaQuery('(max-width: 640px)')
const props = defineProps<{
  business: InvitationInfo
}>()
const modalModel = defineModel({ type: Boolean, default: false }) // handle open/close state
const showRawYears = ref<number[]>([]) // view raw json if year in array

const { data: filings, pending, error } = await useAsyncData(
  'sbc-bar-filing-data',
  () => {
    if (!props.business.identifier) { return {} as Promise<{ filings: ArFilingResponse[]}> } // only fetch if an identifier is given
    return useBarApi<{ filings: ArFilingResponse[] }>(`/business/${props.business.identifier}/filings`, {}, 'token') // return filings by identifier
  },
  {
    server: false, // only run on client
    watch: [() => props.business.identifier], // refetch anytime the identifier changes
    transform (data: { filings: ArFilingResponse[] }) { // transform response data
      const mapped = data.filings.map(data => data.filing) // map response object into array of filings
      const sorted = mapped.sort((a, b) => b.header.filingYear - a.header.filingYear) // sort mapped array by filingYear descending
      return sorted
    }
  }
)

// only return filing count if not pending, no errors and filings isnt null/empty
const filingsCount = computed(() => {
  if (pending.value || error.value || !filings.value) {
    return 0
  } else {
    return filings.value.length
  }
})

// add/remove filing years from array, allows multiple view raws open at once
function handleViewRaw (year: number) {
  const index = showRawYears.value.indexOf(year)
  if (index === -1) {
    showRawYears.value.push(year)
  } else {
    showRawYears.value.splice(index, 1)
  }
}

// reset array anytime the modal closes/opens
watch(modalModel, () => {
  showRawYears.value = []
})

// map error text
const errorText = computed(() => useErrorMessage(error.value as ApiError, t('page.admin.table.invite.detailModal.reportError.title'), t('page.admin.table.invite.detailModal.reportError.description')))
</script>
<template>
  <UModal v-model="modalModel" :fullscreen="isSmallScreen">
    <UCard :ui="{ base: isSmallScreen ? 'h-screen overflow-y-auto' : 'min-w-fit overflow-hidden', body: { base: isSmallScreen ? 'space-y-2' : 'max-h-[75vh] space-y-2 overflow-y-auto' }}">
      <template #header>
        <header class="flex justify-between">
          <div class="flex flex-col">
            <h2 class="text-xl font-semibold text-bcGovColor-darkGray">
              {{ business.legalName }}
            </h2>
            <span class="text-bcGovColor-midGray">{{ business.identifier }}</span>
            <span class="text-bcGovColor-midGray">{{ business.recipients }}</span>
          </div>
          <UButton
            icon="i-mdi-close"
            variant="ghost"
            :aria-label="$t('page.admin.table.invite.detailModal.closeBtn')"
            class="self-start"
            @click="modalModel = false"
          />
        </header>
      </template>

      <h3 class="text-lg font-semibold text-bcGovColor-darkGray">
        {{ $t('labels.annualReports', { count: filingsCount }) }}
      </h3>
      <div v-if="pending" class="relative h-20">
        <SbcLoadingSpinner />
      </div>
      <UAccordion
        v-else-if="!pending && filingsCount > 0"
        :items="filings"
        multiple
        :ui="{ wrapper: 'w-full flex flex-col gap-1' }"
      >
        <template #default="{ item, open }">
          <UButton
            variant="soft"
            size="sm"
            :aria-label="$t('btn.yearAnnualReport', { year: item.header.filingYear })"
            :label="item.header.filingYear.toString()"
            :ui="{ variant: { soft: 'text-base text-bcGovColor-midGray' } }"
          >
            <template #trailing>
              <UIcon
                name="i-mdi-chevron-down"
                class="ms-auto size-7 text-bcGovColor-midGray transition-transform duration-200"
                :class="[open && 'rotate-180']"
              />
            </template>
          </UButton>
        </template>
        <template #item="{ item }">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between">
              <SbcModalAnnualReportDetailsDataSection
                :title="$t('page.admin.table.invite.detailModal.section.reportData.title')"
                :items="[
                  $t('page.admin.table.invite.detailModal.section.reportData.arDate', { value: item.annualReport.annualReportDate }),
                  $t('page.admin.table.invite.detailModal.section.reportData.agmDate', { value: item.annualReport.annualGeneralMeetingDate ?? 'null' }),
                  $t('page.admin.table.invite.detailModal.section.reportData.voteDate', { value: item.annualReport.unanimousResolutionDate ?? 'null' }),
                  $t('page.admin.table.invite.detailModal.section.reportData.noVote', { value: item.annualReport.votedForNoAGM ?? 'null' }),
                ]"
              />
              <UButton
                class="self-start"
                size="sm"
                :label="showRawYears.includes(item.header.filingYear) ? $t('btn.viewRaw.close') : $t('btn.viewRaw.open')"
                icon="i-mdi-code-json"
                @click="handleViewRaw(item.header.filingYear)"
              />
            </div>
            <SbcModalAnnualReportDetailsDataSection
              :title="$t('page.admin.table.invite.detailModal.section.filingData.title')"
              :items="[
                $t('page.admin.table.invite.detailModal.section.filingData.filingDate', { value: item.header.date }),
                $t('page.admin.table.invite.detailModal.section.filingData.filingYear', { value: item.header.filingYear }),
                $t('page.admin.table.invite.detailModal.section.filingData.filingStatus', { value: item.header.status }),
                $t('page.admin.table.invite.detailModal.section.filingData.payStatus', { value: item.header.paymentStatus }),
              ]"
            />
            <SbcModalAnnualReportDetailsDataSection
              v-if="showRawYears.includes(item.header.filingYear)"
              :title="$t('page.admin.table.invite.detailModal.section.rawData.title')"
            >
              <pre class="mt-1 max-w-[90vw] overflow-x-auto"> {{ item }} </pre>
            </SbcModalAnnualReportDetailsDataSection>
          </div>
        </template>
      </UAccordion>
      <div v-else-if="error">
        <UAlert
          :title="errorText.title"
          :description="errorText.description"
          class="text-left"
          icon="i-mdi-alert"
          variant="subtle"
          color="red"
          :ui="{
            title: 'text-base text-bcGovColor-midGray font-semibold',
            description: 'mt-1 text-base leading-4 text-bcGovColor-midGray'
          }"
        />
      </div>
      <div v-else class="flex flex-col items-center justify-center py-4 text-bcGovColor-midGray">
        <UIcon name="i-mdi-database" class="size-8 shrink-0" />
        <span>{{ $t('page.admin.table.invite.detailModal.noReports') }}</span>
      </div>
    </UCard>
  </UModal>
</template>
