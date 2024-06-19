<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  searchText: string
}>()

const showModal = ref(false) // hnalde modal state
const activeBusiness = ref<InvitationInfo>({} as InvitationInfo) // active business for modal details

const columns = [
  {
    key: 'legalName',
    label: t('labels.busName')
    // sortable: true
  },
  {
    key: 'identifier',
    label: t('labels.corpNum')
    // sortable: true
  },
  {
    key: 'recipients',
    label: t('labels.recipients')
    // sortable: true
  },
  {
    key: 'sentDate',
    label: t('labels.sentDate')
    // sortable: true
  },
  {
    key: 'actions',
    label: t('labels.actions')
  }
]

// debounced invitations GET
const { data: invitations, pending, error } = await useAsyncData(
  'sbc-bar-invitations-data',
  useDebounceFn(() => {
    return useBarApi<{ items: InvitationInfo[], limit: number, page: number, total: number }>(
      '/invitations',
      { query: { text: props.searchText } },
      'token'
    )
  }, 500),
  {
    server: false, // only run on client
    watch: [() => props.searchText] // refetch anytime the search text changes
  }
)

function handleOpenModal (business: InvitationInfo) {
  activeBusiness.value = business
  showModal.value = true
}

// map error text from error object
const errorText = computed(() => useErrorMessage(error.value as ApiError, t('page.admin.table.invite.inviteError.title'), t('page.admin.table.invite.inviteError.description')))
</script>
<template>
  <UAlert
    v-if="error"
    :title="errorText.title"
    :description="errorText.description"
    icon="i-mdi-alert"
    variant="subtle"
    color="red"
    :ui="{
      title: 'text-base text-bcGovColor-midGray font-semibold',
      description: 'mt-1 text-base leading-4 text-bcGovColor-midGray'
    }"
  />

  <SbcPageSectionCard
    :heading="$t('labels.searchResults', { count: invitations?.total || 0 })"
    class="overflow-hidden"
  >
    <UTable
      :rows="invitations?.items || []"
      :columns="columns"
      :loading="pending"
      class="-m-5"
      :empty-state="{
        icon: 'i-mdi-database',
        label: $t('page.admin.table.invite.emptyText')
      }"
      :ui="{ wrapper: 'relative overflow-auto max-h-[40rem] min-h-96', thead: 'sticky top-0 bg-white ring-[1px] ring-gray-200' }"
    >
      <template #loading-state>
        <div class="relative mt-24 h-20">
          <SbcLoadingSpinner />
        </div>
      </template>
      <template #sentDate-data="{ row }">
        <span> {{ datetimeStringToDateString(row.sentDate) }}</span>
      </template>
      <template #actions-data="{ row }">
        <UButton
          size="md"
          :label="$t('btn.viewDetails')"
          @click="handleOpenModal(row)"
        />
      </template>
    </UTable>
    <SbcModalAnnualReportDetails
      v-model="showModal"
      :business="activeBusiness"
    />
  </SbcPageSectionCard>
</template>
