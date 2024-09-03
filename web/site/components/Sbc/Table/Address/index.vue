<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  offices: {
    recordsOffice?: Office
    registeredOffice?: Office
  } | undefined
}>()

const columns = [
  {
    label: t('labels.office'),
    key: 'name'
  },
  {
    key: 'mailingAddress',
    label: t('labels.mailingAddress')
  },
  {
    key: 'deliveryAddress',
    label: t('labels.deliveryAddress')
  }
]

const addresses = computed(() => {
  const offices = []
  if (props.offices?.registeredOffice) {
    offices.push({
      name: t('labels.registeredOffice'),
      mailingAddress: props.offices.registeredOffice.mailingAddress,
      deliveryAddress: props.offices.registeredOffice.deliveryAddress
    })
  }
  if (props.offices?.recordsOffice) {
    offices.push({
      name: t('labels.recordsOffice'),
      mailingAddress: props.offices.recordsOffice.mailingAddress,
      deliveryAddress: props.offices.recordsOffice.deliveryAddress
    })
  }
  return offices
})
</script>
<template>
  <div>
    <!-- Desktop / Tablet View -->
    <div class="hidden sm:block">
      <UTable
        :rows="addresses"
        :columns
        :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: $t('page.annualReport.noAddresses') }"
      >
        <template #mailingAddress-data="{ row }">
          <SbcAddressDisplay :address="row.mailingAddress" />
        </template>

        <template #name-data="{ row }">
          <span class="font-semibold text-bcGovColor-darkGray"> {{ row.name }} </span>
        </template>

        <template #deliveryAddress-data="{ row }">
          <SbcAddressDisplay v-if="!deepEqual(row.mailingAddress, row.deliveryAddress, ['addressId'])" :address="row.deliveryAddress" />
          <span v-else> {{ $t('labels.sameAsMailAddress') }} </span>
        </template>
      </UTable>
    </div>

    <!-- Mobile View -->
    <div class="block sm:hidden">
      <div v-for="(row, index) in addresses" :key="index" :class="{'pt-3': index !== 0}">
        <div class="text-lg font-bold">
          {{ row.name }}
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
      </div>
    </div>
  </div>
</template>
