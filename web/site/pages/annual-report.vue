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
  title: t('page.annualReport.title')
})

interface ARFiling {
  agmDate: Date | null,
  votedForNoAGM: boolean
}

// options for radio buttons
const options = [
  {
    label: t('page.annualReport.form.heldAgm.opt1'),
    value: 'option-1'
  },
  {
    label: t('page.annualReport.form.heldAgm.opt2'),
    value: 'option-2'
  },
  {
    label: t('page.annualReport.form.heldAgm.opt3'),
    value: 'option-3'
  }
]

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)
const dateSelectRef = ref<InstanceType<typeof SbcInputsDateSelect> | null>(null)
const selectedRadio = ref<string>('option-1')
const loading = ref<boolean>(false)

// form state
const arData = reactive<{ agmDate: string | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  officeAndDirectorsConfirmed: false
})

// redirect user to pay screen
async function handlePayment (payToken: number, filingId: number): Promise<void> {
  const returnUrl = encodeURIComponent(`${baseUrl}${locale.value}/submitted?filing_id=${filingId}`)
  const payUrl = paymentUrl + payToken + '/' + returnUrl
  // assume Pay URL is always reachable
  // otherwise, user will have to retry payment later
  await navigateTo(payUrl, { external: true })
}

// custom validate the form
const validate = (state: any): FormError[] => {
  const errors = []
  // if yes to agm, user must input a date
  if (selectedRadio.value === 'option-1' && !state.agmDate) {
    errors.push({ path: 'agmDate', message: 'You must select a date if you held an AGM' })
  }
  // user must confirm to submit form
  if (!state.officeAndDirectorsConfirmed) {
    errors.push({ path: 'officeAndDirectorsConfirmed', message: 'You must confirm to continue' })
  }
  return errors
}

// handle submitting filing and directing to pay screen
async function submitAnnualReport (event: FormSubmitEvent<any>) {
  try {
    loading.value = true
    const arFiling: ARFiling = {
      agmDate: selectedRadio.value === 'option-1' ? event.data.agmDate : null,
      votedForNoAGM: selectedRadio.value === 'option-3'
    }
    // // console.log(arFiling)
    const { paymentToken, filingId } = await arStore.submitAnnualReportFiling(arFiling)
    // // console.log(paymentToken, filingId)
    await handlePayment(paymentToken, filingId)
  } catch (e: any) {
    console.log(e)
    // do something if submitting ar fails
  }
}

// focus errored field
function onError (event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// clear date if switching radio optins
function handleRadioClick (option: string) {
  if (selectedRadio.value !== option) {
    arFormRef.value?.clear()
    selectedRadio.value = option // this allows clicking anywhere in the radio button wrapper, not just the icon or label
    dateSelectRef.value?.updateDate(null)
    arData.agmDate = null
  }
}

// load fees for fee widget, might move into earlier setup
onMounted(() => {
  addBarPayFees()
})
</script>
<template>
  <div class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left sm:gap-8 md:flex-row">
    <SbcLoadingSpinner v-if="loading" overlay />
    <div class="flex w-full flex-1 flex-col gap-6">
      <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
        {{ $t('page.annualReport.h1', { year: busStore.currentBusiness.nextARYear}) }}
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
            {{ $t('page.annualReport.h2', { name: busStore.currentBusiness.legalName }) }}
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

        <UForm
          ref="arFormRef"
          :state="arData"
          :validate="validate"
          autocomplete="off"
          class="space-y-6"
          @submit="submitAnnualReport"
          @error="onError"
        >
          <!-- TO DO: look into why this label isnt being associated with the radios -->
          <UFormGroup name="radioGroup" :label="$t('page.annualReport.form.heldAgm.question')">
            <fieldset
              class="flex flex-col items-start gap-4 lg:flex-row lg:items-center"
            >
              <!-- need to look into this for a11y more -->
              <legend class="sr-only">
                {{ $t('page.annualReport.form.heldAgm.question') }}
              </legend>
              <URadio
                v-for="option of options"
                :key="option.value"
                v-bind="option"
                v-model="selectedRadio"
                :options="options"
                :ui="{
                  wrapper: `cursor-pointer relative flex items-center flex-1 w-full p-4 ${selectedRadio === option.value ? 'bg-white border border-bcGovColor-activeBlue' : 'bg-gray-100 hover:bg-gray-200'}`,
                  label: 'cursor-pointer sm:whitespace-nowrap',
                }"
                @click="handleRadioClick(option.value)"
              />
            </fieldset>
          </UFormGroup>

          <!-- AGM Date -->
          <UFormGroup name="agmDate" class="mt-4" :help="$t('page.annualReport.form.agmDate.format', { format: 'YYYY-MM-DD' })" :ui="{ help: 'text-bcGovColor-midGray' }">
            <SbcInputsDateSelect
              id="SelectAGMDate"
              ref="dateSelectRef"
              :max-date="new Date()"
              :placeholder="$t('page.annualReport.form.agmDate.placeholder')"
              :arialabel="$t('page.annualReport.form.agmDate.label')"
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
            <UCheckbox v-model="arData.officeAndDirectorsConfirmed" :label="$t('page.annualReport.form.certify')" />
          </UFormGroup>
        </UForm>
      </UCard>
    </div>
    <SbcFeeWidget
      class="sm:mt-2"
      :fees="payFeesWidget.fees"
      @submit="arFormRef?.submit()"
    />
  </div>
</template>
