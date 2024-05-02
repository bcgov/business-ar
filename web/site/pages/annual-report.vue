<script setup lang="ts">
import { z } from 'zod'
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UForm } from '#components'
const { t, locale } = useI18n()
const config = useRuntimeConfig()
const paymentUrl = config.public.paymentPortalUrl
const baseUrl = config.public.baseUrl
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()

useHead({
  title: t('page.home.title')
})

const options = [
  { label: 'Yes', value: 'option-1' },
  { label: 'We have not held an AGM yet', value: 'option-2' },
  { label: 'We unanimously voted to not hold an AGM', value: 'option-3' }
]

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

async function handlePayment (payToken: number, filingId: string): Promise<void> {
  const returnUrl = encodeURIComponent(`${baseUrl}${locale.value}/submitted?filing_id=${filingId}`)
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

const selected = ref('option-1')
</script>
<template>
  <div class="mx-auto flex max-w-[1360px] grid-cols-12 flex-col gap-4 text-left sm:gap-8 lg:grid">
    <h1 class="col-span-3 col-start-1 row-start-1 text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      <!-- {{ $t('page.home.h1') }} -->
      2023 Annual Report
    </h1>
    <SbcFeeWidget
      class="col-start-10 row-start-1"
      :fees="payFeesWidget.fees"
      @submit="arFormRef?.submit()"
    />
    <div class="col-start-1 col-end-9 row-start-2 flex flex-col gap-8 lg:flex-row">
      <UCard
        class="w-full lg:max-w-4xl"
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

        <UDivider class="mb-4 mt-8" />

        <UForm
          ref="arFormRef"
          :state="ARData"
          :schema="ARSchema"
          autocomplete="off"
          class="space-y-6"
          @submit="submitAnnualReport"
          @error="onError"
        >
          <!-- class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-4" -->
          <UFormGroup label="Has your company held an Annual General Meeting?">
            <div
              class="flex flex-col items-start gap-4 lg:flex-row lg:items-center"
            >
              <URadio
                v-for="option of options"
                :key="option.value"
                v-bind="option"
                v-model="selected"
                :options="options"
                :ui="{
                  wrapper: `cursor-pointer relative flex items-center flex-1 w-full p-4 ${selected === option.value ? 'bg-white border border-bcGovColor-activeBlue' : 'bg-gray-100 hover:bg-gray-200'}`,
                  label: 'whitespace-nowrap cursor-pointer',
                }"
                @click="selected = option.value"
              />
            </div>
          </UFormGroup>
          <!-- AGM Date -->
          <UFormGroup name="AGMDate" class="mt-4" help="Format: YYYY-MM-DD" :ui="{ help: 'text-bcGovColor-midGray' }">
            <SbcInputsDateSelect
              id="SelectAGMDate"
              :max-date="new Date()"
              placeholder="Select Annual General Meeting Date"
              variant="bcGov"
              :disabled="selected !== 'option-1'"
              @selection="ARData.AGMDate = dateToString($event!, 'YYYY-MM-DD')"
            />
          </UFormGroup>

          <UDivider />

          <!-- certify office address and directors -->
          <UFormGroup name="officeAndDirectorsConfirmed">
            <UCheckbox v-model="ARData.officeAndDirectorsConfirmed" label="I certify all information about the Office Addresses and Current Directors is correct." />
          </UFormGroup>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
