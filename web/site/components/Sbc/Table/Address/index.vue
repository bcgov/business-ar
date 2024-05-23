<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  offices: {
    recordsOffice: Office
    registeredOffice: Office
  }
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
  return [
    {
      name: t('labels.registeredOffice'),
      mailingAddress: props.offices.registeredOffice.mailingAddress,
      deliveryAddress: props.offices.registeredOffice.deliveryAddress
    },
    {
      name: t('labels.recordsOffice'),
      mailingAddress: props.offices.recordsOffice.mailingAddress,
      deliveryAddress: props.offices.recordsOffice.deliveryAddress
    }
  ]
})
</script>
<template>
  <UTable :rows="addresses" :columns>
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
</template>
