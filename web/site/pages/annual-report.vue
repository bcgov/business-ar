<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UForm, SbcInputsDateSelect } from '#components'
const { t, locale } = useI18n()
const config = useRuntimeConfig()
const paymentUrl = config.public.paymentPortalUrl
const baseUrl = config.public.baseUrl
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const payFeesWidget = usePayFeesWidget()

useHead({
  title: t('page.home.title')
})

const options = [
  { label: 'Yes', value: 'option-1' },
  { label: 'We have not held an AGM yet', value: 'option-2' },
  { label: 'We unanimously voted to not hold an AGM', value: 'option-3' }
]

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)
const dateSelectRef = ref<InstanceType<typeof SbcInputsDateSelect> | null>(null)
const selectedRadio = ref<string>('option-1')
const loading = ref<boolean>(false)

const arData = reactive<{ agmDate: string | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  officeAndDirectorsConfirmed: false
})

async function handlePayment (payToken: number, filingId: number): Promise<void> {
  const returnUrl = encodeURIComponent(`${baseUrl}${locale.value}/submitted?filing_id=${filingId}`)
  const payUrl = paymentUrl + payToken + '/' + returnUrl
  // assume Pay URL is always reachable
  // otherwise, user will have to retry payment later
  await navigateTo(payUrl, { external: true })
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (selectedRadio.value === 'option-1' && !state.agmDate) {
    errors.push({ path: 'agmDate', message: 'You must select a date if you held an AGM' })
  }
  if (!state.officeAndDirectorsConfirmed) {
    errors.push({ path: 'officeAndDirectorsConfirmed', message: 'You must confirm to continue' })
  }
  return errors
}

interface ARFiling {
  agmDate: Date | null,
  votedForNoAGM: boolean
}

async function submitAnnualReport (event: FormSubmitEvent<any>) {
  try {
    loading.value = true
    const arFiling: ARFiling = {
      agmDate: selectedRadio.value === 'option-1' ? event.data.agmDate : null,
      votedForNoAGM: selectedRadio.value === 'option-3'
    }
    console.log(arFiling)
    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling(arFiling)
    console.log(paymentToken, filingId)
    await handlePayment(paymentToken, filingId)
  } catch (e: any) {
    console.log(e)
    // do something if submitting ar fails
  } finally {
    loading.value = false
  }
}

function onError (event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function handleRadioClick (option: string) {
  if (selectedRadio.value !== option) {
    arFormRef.value?.clear()
    selectedRadio.value = option
    dateSelectRef.value?.updateDate(null)
    arData.agmDate = null
  }
}

onMounted(() => {
  addBarPayFees()
})
</script>
<template>
  <div class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left sm:gap-8 md:flex-row">
    <div class="flex w-full flex-1 flex-col gap-6">
      <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
        <!-- {{ $t('page.home.h1') }} -->
        2023 Annual Report
      </h1>
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
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray lg:col-start-5 xl:col-start-4">{{ busStore.currentBusiness.legalName }}</span>
          <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.corpNum') }}</span>
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray lg:col-start-5 xl:col-start-4">{{ busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier }}</span>
          <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.arDate') }}</span>
          <span class="col-span-full whitespace-nowrap text-bcGovColor-midGray lg:col-start-5 xl:col-start-4">{{ busStore.nextArDate }}</span>
        </div>

        <UDivider class="mb-4 mt-8" />

        <!-- :schema="ARSchema" -->

        <UForm
          ref="arFormRef"
          :state="arData"
          :validate="validate"
          autocomplete="off"
          class="space-y-6"
          @submit="submitAnnualReport"
          @error="onError"
        >
          <!-- class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-4" -->
          <UFormGroup name="radioGroup" label="Has your company held an Annual General Meeting?">
            <div
              class="flex flex-col items-start gap-4 xl:flex-row xl:items-center"
            >
              <URadio
                v-for="option of options"
                :key="option.value"
                v-bind="option"
                v-model="selectedRadio"
                :options="options"
                :ui="{
                  wrapper: `cursor-pointer relative flex items-center flex-1 w-full p-4 ${selectedRadio === option.value ? 'bg-white border border-bcGovColor-activeBlue' : 'bg-gray-100 hover:bg-gray-200'}`,
                  label: 'whitespace-nowrap cursor-pointer',
                }"
                @click="handleRadioClick(option.value)"
              />
            </div>
          </UFormGroup>

          <!-- AGM Date -->
          <UFormGroup name="agmDate" class="mt-4" help="Format: YYYY-MM-DD" :ui="{ help: 'text-bcGovColor-midGray' }">
            <SbcInputsDateSelect
              id="SelectAGMDate"
              ref="dateSelectRef"
              :max-date="new Date()"
              placeholder="Select Annual General Meeting Date"
              variant="bcGov"
              :disabled="selectedRadio !== 'option-1'"
              @selection="(e) => {
                arFormRef?.clear()
                arData.agmDate = dateToString(e!, 'YYYY-MM-DD')}"
            />
          </UFormGroup>

          <UDivider />

          <!-- certify office address and directors -->
          <UFormGroup name="officeAndDirectorsConfirmed">
            <UCheckbox v-model="arData.officeAndDirectorsConfirmed" label="I certify all information about the Office Addresses and Current Directors is correct." />
          </UFormGroup>
        </UForm>
      </UCard>
    </div>
    <SbcFeeWidget
      class="mt-2"
      :fees="payFeesWidget.fees"
      @submit="arFormRef?.submit()"
    />
  </div>
</template>
