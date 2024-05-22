<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UForm, SbcInputsDateSelect } from '#components'
const { t } = useI18n()
const localePath = useLocalePath()
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const payFeesWidget = usePayFeesWidget()
const loadStore = useLoadingStore()
loadStore.pageLoading = true

useHead({
  title: t('page.annualReport.title')
})

definePageMeta({
  middleware: ['filing-paid', 'require-account']
})

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
const errorAlert = reactive({
  title: '',
  description: ''
})

// form state
const arData = reactive<{ agmDate: string | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  officeAndDirectorsConfirmed: false
})

// custom validate the form
const validate = (state: any): FormError[] => {
  const errors = []
  // if yes to agm, user must input a date
  if (selectedRadio.value === 'option-1' && !state.agmDate) {
    errors.push({ path: 'agmDate', message: t('page.annualReport.form.agmDate.error') })
  }
  // user must confirm to submit form
  if (!state.officeAndDirectorsConfirmed) {
    errors.push({ path: 'officeAndDirectorsConfirmed', message: t('page.annualReport.form.certify.error') })
  }
  return errors
}

// handle submitting filing and directing to pay screen
async function submitAnnualReport (event: FormSubmitEvent<any>) {
  try {
    loading.value = true
    // set data based off radio button value
    const arFiling: ARFiling = {
      agmDate: selectedRadio.value === 'option-1' ? event.data.agmDate : null,
      votedForNoAGM: selectedRadio.value === 'option-3'
    }
    // submit filing
    const { paymentToken, filingId, payStatus } = await arStore.submitAnnualReportFiling(arFiling)

    console.log(payStatus)
    if (payStatus === 'PAID') {
      await navigateTo(localePath(`/submitted?filing_id=${filingId}`))
    } else {
      // redirect to pay with the returned token and filing id
      await handlePaymentRedirect(paymentToken, filingId)
    }
  } catch (e) {
    // log and display error alert if this fails
    const msg = (e as Error).message ?? 'Could not complete filing or payment request, please try again.'
    console.error(msg)
    errorAlert.description = msg
  } finally {
    loading.value = false
  }
}

// focus errored field
function onError (event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// clear date if switching radio options
function handleRadioClick (option: string) {
  if (selectedRadio.value !== option) {
    arFormRef.value?.clear()
    selectedRadio.value = option // this allows clicking anywhere in the radio button wrapper, not just the icon or label
    dateSelectRef.value?.updateDate(null)
    arData.agmDate = null
  }
}

onMounted(() => {
  try {
    // load fees for fee widget, might move into earlier setup
    addBarPayFees()

    // try to prefill form if a filing exists
    if (Object.keys(arStore.arFiling).length !== 0) {
      // add payment error message if pay status exists and doesnt equal paid
      if (arStore.arFiling.filing.header.status && arStore.arFiling.filing.header.status !== 'PAID') {
        errorAlert.title = t('page.annualReport.payError.title')
        errorAlert.description = t('page.annualReport.payError.description')
      }

      const votedForNoAGM = arStore.arFiling.filing.annualReport.votedForNoAGM
      const agmDate = arStore.arFiling.filing.annualReport.annualGeneralMeetingDate
      if (votedForNoAGM) {
        selectedRadio.value = 'option-3'
      } else if (!votedForNoAGM && !agmDate) {
        selectedRadio.value = 'option-2'
      } else if (agmDate) {
        arData.agmDate = agmDate
      }
    }
  } finally {
    loadStore.pageLoading = false
  }
})
</script>
<template>
  <ClientOnly>
    <div v-show="!loadStore.pageLoading" class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left sm:gap-8 md:flex-row">
      <div class="flex w-full flex-1 flex-col gap-6">
        <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
          {{ $t('page.annualReport.h1', { year: busStore.currentBusiness.nextARYear}) }}
        </h1>

        <UAlert
          v-if="errorAlert.title || errorAlert.description"
          :title="errorAlert.title"
          :description="errorAlert.description"
          icon="i-mdi-alert"
          color="red"
          variant="subtle"
          :ui="{
            title: 'text-base text-bcGovColor-midGray font-semibold',
            description: 'mt-1 text-base leading-4 text-bcGovColor-midGray'
          }"
        />

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

          <SbcBusinessInfo
            break-value="lg"
            :items="[
              { label: $t('labels.busName'), value: busStore.businessNano.legalName },
              { label: $t('labels.corpNum'), value: busStore.businessNano.identifier },
              { label: $t('labels.arDate'), value: busStore.nextArDate },
            ]"
          />

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
                :initial-date="arData.agmDate ? new Date(arData.agmDate) : undefined"
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
              <UCheckbox v-model="arData.officeAndDirectorsConfirmed" :label="$t('page.annualReport.form.certify.question')" />
            </UFormGroup>
          </UForm>
        </UCard>
      </div>
      <SbcFeeWidget
        class="sm:mt-2"
        :fees="payFeesWidget.fees"
        :is-loading="loading"
        @submit="arFormRef?.submit()"
      />
    </div>
  </ClientOnly>
</template>
