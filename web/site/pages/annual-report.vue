<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UForm } from '#components'
// const localePath = useLocalePath()
const { t } = useI18n()
const config = useRuntimeConfig()
const apiUrl = config.public.barApiUrl
const paymentUrl = config.public.paymentPortalUrl
const busStore = useBusinessStore()
const accountStore = useSbcAccount()

useHead({
  title: t('page.home.title')
})

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)
// const taxInfo: Tax = {
//   gst: 5.00,
//   pst: 7.00
// }

const companyDetails = ref([
  {
    label: 'Corporation Number',
    value: busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier
  },
  {
    label: 'Company Name',
    value: busStore.currentBusiness.legalName
  },
  {
    label: 'Date of Annual Report',
    value: busStore.currentBusiness.lastArDate
  }
])

// Define an array of PayFeesWidgetItem objects
// const payFeesWidgetItems: PayFeesWidgetItem[] = [
//   {
//     uiUuid: '123456789',
//     filingFees: 100.00,
//     filingType: 'Annual Report',
//     filingTypeCode: 'AR',
//     futureEffectiveFees: 0,
//     priorityFees: 25.00,
//     processingFees: 10.00,
//     serviceFees: 50.00,
//     tax: taxInfo,
//     total: 185.00,
//     quantity: 1 // Optional field
//   }
// {
//   uiUuid: '987654321',
//   filingFees: 150.00,
//   filingType: 'Name Change',
//   filingTypeCode: 'NC',
//   futureEffectiveFees: 0,
//   priorityFees: 30.00,
//   processingFees: 15.00,
//   serviceFees: 75.00,
//   tax: taxInfo,
//   total: 270.00,
//   quantity: 1 // Optional field
// }
// ]

const ARData = reactive({
  AGMDate: '',
  noAGMHeld: false,
  officeAndDirectorsConfirmed: false
})

const ARSchema = z.object({
  AGMDate: z.string().refine((str: string) => {
    if (str) {
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(str) &&
    new Date(str).toISOString().startsWith(str)
      )
    } else { return true }
  }, 'Date must be in YYYY-MM-DD format. Example: 2024-11-20').optional(),
  noAGMHeld: z.boolean().optional(),
  officeAndDirectorsConfirmed: z.literal<boolean>(true, { errorMap: () => ({ message: 'Please confirm to continue' }) })
})

type FormSchema = z.output<typeof ARSchema>

async function submitARForm (event: FormSubmitEvent<FormSchema>) {
  // Do something with event.data
  const { $keycloak } = useNuxtApp()
  const account = useSbcAccount()
  console.log('form submit', arFormRef.value)
  console.log(event.data)
  console.log(event)
  await $fetch(apiUrl + '/business/BC0005063/filings', {
    method: 'POST',
    body: {
      filing: {
        header: {
          filingYear: 2020
        },
        annualReport: {
          annualGeneralMeetingDate: '2020-01-01',
          annualReportDate: '2020-12-31'
        }
      }
    },
    headers: {
      Authorization: `Bearer ${$keycloak.token}`,
      'Account-Id': account.currentAccount.id
    },
    onResponse ({ response }) {
      console.log('response: ', response)
    }
  })
}

async function onError (event: FormErrorEvent) {
  console.log('error: ', event)
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const payFeesWidget = usePayFeesWidget()
const filingData: FilingData[] = [
  {
    entityType: 'BC',
    filingTypeCode: 'ANNBC',
    futureEffective: false,
    priority: false,
    waiveFees: false
  }
]

// todo: update getting folio number from store when there is this data available
payFeesWidget.loadFeeTypesAndCharges('custom', filingData)

onMounted(() => {
  addBarPayFees()
})

watchEffect(() => console.log('fees: ', payFeesWidget.fees))

async function affiliateBusinessWithAccount () {
  const { $keycloak } = useNuxtApp()
  await $fetch(`${apiUrl}/user/accounts/${accountStore.currentAccount.id}/affiliate`, {
    method: 'POST',
    body: {
      businessIdentifier: busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier
    },
    headers: {
      Authorization: `Bearer ${$keycloak.token}`
    },
    onResponse ({ response }) {
      console.log(response)
    }
  })
}
</script>
<template>
  <div class="mx-auto mb-0 flex flex-col gap-4 text-left sm:gap-8 md:mb-40">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      <!-- {{ $t('page.home.h1') }} -->
      2023 Annual Report
    </h1>
    <div class="flex flex-col gap-8 md:flex-row">
      <UCard
        class="w-full"
        :ui="{
          header: {
            base: 'rounded-t-lg',
            background: 'bg-bcGovColor-gray2',
            padding: 'px-4 py-5 sm:px-6',
          }
        }"
      >
        <template #header>
          <h2 class="font-semibold text-bcGovColor-darkGray dark:text-white">
            Annual Report for: {{ busStore.currentBusiness.legalName }}
          </h2>
        </template>
        <!-- display company details -->
        <div v-for="item in companyDetails" :key="item.label" class="grid grid-cols-12">
          <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ item.label }}</span>
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray md:col-start-7 lg:col-start-5 xl:col-start-4">{{ item.value }}</span>
        </div>

        <UDivider class="my-8" />

        <UForm
          ref="arFormRef"
          :state="ARData"
          :schema="ARSchema"
          autocomplete="off"
          class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-4"
          @submit="submitARForm"
          @error="onError"
        >
          <!-- AGM Date -->
          <span class="col-span-1 col-start-1 row-span-1 row-start-1 font-semibold text-bcGovColor-darkGray">AGM Date</span>
          <UFormGroup name="AGMDate" class="col-span-full col-start-2 row-span-1 row-start-1" help="Format: YYYY-MM-DD" :ui="{ help: 'text-bcGovColor-midGray' }">
            <SbcInputsDateSelect
              id="SelectAGMDate"
              :max-date="new Date()"
              placeholder="Select Date"
              variant="bcGov"
              @selection="ARData.AGMDate = dateToString($event!, 'YYYY-MM-DD')"
            />
            <!-- :variant="birthDateErrors.length > 0 ? 'error' : 'bcGov'" -->
            <!-- :errors="birthDateErrors" -->
            <!-- @selection="significantIndividual.profile.birthDate = dateToString($event, 'YYYY-MM-DD')" -->
          </UFormGroup>
          <UFormGroup name="noAGMHeld" class="col-span-full col-start-2 row-span-1 row-start-2">
            <UCheckbox v-model="ARData.noAGMHeld" label="No AGM Held" />
          </UFormGroup>
          <UFormGroup name="officeAndDirectorsConfirmed" class="col-span-full col-start-2 row-span-1 row-start-3">
            <UCheckbox v-model="ARData.officeAndDirectorsConfirmed" label="All information about the Office Addresses and Current Directors is Correct. " />
          </UFormGroup>
        </UForm>
      </UCard>
      <SbcFeeWidget
        :fees="payFeesWidget.fees"
        @submit="affiliateBusinessWithAccount"
      />
      <!-- @submit="arFormRef?.submit()"  -->
    </div>
  </div>
</template>
