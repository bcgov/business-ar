<script setup lang="ts">
const { t } = useI18n()
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

const business = {
  business: {
    corpState: 'HDA',
    corpStateClass: 'HIS',
    email: null,
    foundingDate: '2008-01-24T17:40:11-00:00',
    goodStanding: null,
    homeCompanyName: null,
    homeJurisdictionNumber: null,
    homeRecognitionDate: null,
    identifier: '0814603',
    jurisdiction: 'BC',
    lastAgmDate: null,
    lastArDate: '2011-01-25',
    lastLedgerTimestamp: '2023-04-24T05:53:04-00:00',
    legalName: 'CLIMATE LAW CORPORATION',
    legalType: 'BC',
    nextARYear: 2012,
    status: 'Administrative Dissolution',
    taxId: '123'
  },
  offices: {
    recordsOffice: {
      deliveryAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883792,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400 - 2455 W. 2nd Ave.',
        streetAddressAdditional: ' '
      },
      mailingAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883793,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400 - 2455 W. 2nd Ave.',
        streetAddressAdditional: ' '
      }
    },
    registeredOffice: {
      deliveryAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883790,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400 - 2455 W. 2nd Ave.',
        streetAddressAdditional: ' '
      },
      mailingAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883791,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400 - 2455 W. 2nd Ave.',
        streetAddressAdditional: ' '
      }
    }
  },
  parties: [
    {
      actions: [],
      appointmentDate: 'Thu, 24 Jan 2008 09:40:11 GMT',
      cessationDate: null,
      deliveryAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883789,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400-2455 W.2nd. Ave',
        streetAddressAdditional: ' '
      },
      endEventId: '',
      id: 2948914,
      mailingAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883788,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400-2455 W.2nd. Ave',
        streetAddressAdditional: ' '
      },
      officer: {
        firstName: 'Robb',
        lastName: 'Miller',
        middleInitial: 'Philip',
        orgName: ''
      },
      roles: [
        {
          appointmentDate: 'Thu, 24 Jan 2008 09:40:11 GMT',
          cessationDate: null,
          roleType: 'Director'
        }
      ],
      startEventId: 8086779,
      title: ''
    },
    {
      actions: [],
      appointmentDate: 'Thu, 24 Jan 2008 09:40:11 GMT',
      cessationDate: null,
      deliveryAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883789,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400-2455 W.2nd. Ave',
        streetAddressAdditional: ' '
      },
      endEventId: '',
      id: 2948914,
      mailingAddress: {
        actions: [],
        addressCity: 'Vancouver',
        addressCountry: 'CANADA',
        addressId: 5883788,
        addressRegion: 'BC',
        deliveryInstructions: '',
        postalCode: 'V6K 1J5',
        streetAddress: '400-2455 W.2nd. Ave',
        streetAddressAdditional: ' '
      },
      officer: {
        firstName: 'Robb',
        lastName: 'Miller',
        middleInitial: 'Philip',
        orgName: ''
      },
      roles: [
        {
          appointmentDate: 'Thu, 24 Jan 2008 09:40:11 GMT',
          cessationDate: null,
          roleType: 'Director'
        }
      ],
      startEventId: 8086779,
      title: ''
    }
  ]
}

const addresses = [
  {
    name: t('labels.registeredOffice'),
    mailingAddress: business.offices.registeredOffice.mailingAddress,
    deliveryAddress: business.offices.registeredOffice.deliveryAddress
  },
  {
    name: t('labels.recordsOffice'),
    mailingAddress: business.offices.recordsOffice.mailingAddress,
    deliveryAddress: business.offices.recordsOffice.deliveryAddress
  }
]
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
