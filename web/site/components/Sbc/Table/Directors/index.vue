<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  directors: Party[] | undefined
}>()

const columns = [
  {
    key: 'name',
    label: t('labels.name')
  },
  {
    key: 'mailingAddress',
    label: t('labels.mailingAddress')
  },
  {
    key: 'deliveryAddress',
    label: t('labels.deliveryAddress')
  },
  {
    key: 'effectiveDates',
    label: t('labels.effectiveDates')
  }
]

// only show parties with role of director
// map into key/value pair for table
const parties = computed(() => {
  if (!props.directors) { return [] }
  return props.directors
    .filter(party => party.roles.some(role => role.roleType === 'Director'))
    .map(party => ({
      name: `${party.officer.firstName} ${party.officer.middleInitial} ${party.officer.lastName}`,
      mailingAddress: party.mailingAddress,
      deliveryAddress: party.deliveryAddress,
      effectiveDates: t('labels.apptDate', { date: datetimeStringToDateString(party.roles[0].appointmentDate) })
    }))
})
</script>
<template>
  <div>
    <!-- Desktop / Tablet View -->
    <div class="hidden sm:block">
      <UTable
        :rows="parties"
        :columns
        :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: $t('page.annualReport.noDirectors') }"
      >
        <template #mailingAddress-data="{ row }">
          <SbcAddressDisplay :address="row.mailingAddress" />
        </template>

        <template #name-data="{ row }">
          <span class="font-semibold text-bcGovColor-darkGray"> {{ parseSpecialChars(row.name).toLocaleUpperCase($i18n.locale) }} </span>
        </template>

        <template #deliveryAddress-data="{ row }">
          <SbcAddressDisplay v-if="!deepEqual(row.mailingAddress, row.deliveryAddress, ['addressId'])" :address="row.deliveryAddress" />
          <span v-else> {{ $t('labels.sameAsMailAddress') }} </span>
        </template>
      </UTable>
    </div>

    <!-- Mobile View -->
    <div class="block sm:hidden">
      <div v-for="(row, index) in parties" :key="index" :class="{'pt-3': index !== 0}">
        <div class="text-lg font-bold">
          {{ parseSpecialChars(row.name).toLocaleUpperCase($i18n.locale) }}
        </div>

        <div class="px-4 pt-2">
          <div class="font-bold">
            {{ t('labels.mailingAddress') }}
          </div>
          <SbcAddressDisplay :address="row.mailingAddress" />
        </div>

        <div class="px-4 pt-3">
          <div class="font-bold">
            {{ t('labels.deliveryAddress') }}
          </div>
          <div v-if="!deepEqual(row.mailingAddress, row.deliveryAddress, ['addressId'])">
            <SbcAddressDisplay :address="row.deliveryAddress" />
          </div>
          <span v-else>{{ $t('labels.sameAsMailAddress') }}</span>
        </div>

        <div class="px-4 pt-3">
          <div class="font-bold">
            {{ t('labels.effectiveDates') }}
          </div>
          {{ row.effectiveDates }}
        </div>
      </div>
    </div>
  </div>
</template>
