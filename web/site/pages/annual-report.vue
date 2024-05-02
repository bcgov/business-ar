<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UForm } from '#components'
// const localePath = useLocalePath()
const { t } = useI18n()
const config = useRuntimeConfig()
const paymentUrl = config.public.paymentPortalUrl
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()

useHead({
  title: t('page.home.title')
})

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)

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

async function handlePayment (payToken: number): Promise<void> {
  // const returnUrl = encodeURIComponent('http://localhost:3000/en-CA/submitted' + '?filing_id=' + this.filingId)
  const returnUrl = encodeURIComponent('http://localhost:3000/en-CA/submitted')
  const payUrl = paymentUrl + payToken + '/' + returnUrl
  // assume Pay URL is always reachable
  // otherwise, user will have to retry payment later
  await navigateTo(payUrl, { external: true })
}

async function submitAnnualReport (event: FormSubmitEvent<FormSchema>) {
  try {
    await busStore.affiliateBusinessWithAccount()
    const paymentToken = await arStore.submitAnnualReportFiling(null)
    // console.log(paymentToken)
    handlePayment(paymentToken!)
  } catch (e: any) {
    console.log(e)
    // do something if submitting ar fails
  }
  // Do something with event.data
  // console.log('form submit', arFormRef.value)
  // console.log(event.data)
}

async function onError (event: FormErrorEvent) {
  console.log('error: ', event)
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const payFeesWidget = usePayFeesWidget()

onMounted(() => {
  addBarPayFees()
})
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
        <div class="grid grid-cols-12">
          <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.busName') }}</span>
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray md:col-start-7 lg:col-start-5 xl:col-start-4">{{ busStore.currentBusiness.legalName }}</span>
          <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.corpNum') }}</span>
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray md:col-start-7 lg:col-start-5 xl:col-start-4">{{ busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier }}</span>
          <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.arDate') }}</span>
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray md:col-start-7 lg:col-start-5 xl:col-start-4">{{ busStore.nextArDate }}</span>
        </div>

        <UDivider class="my-8" />

        <UForm
          ref="arFormRef"
          :state="ARData"
          :schema="ARSchema"
          autocomplete="off"
          class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-4"
          @submit="submitAnnualReport"
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
        @submit="arFormRef?.submit()"
      />
    </div>
  </div>
</template>
