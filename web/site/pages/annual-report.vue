<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UCheckbox, UTooltip, UForm } from '#components'
const { t } = useI18n()
const localePath = useLocalePath()
const keycloak = useKeycloak()
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const payFeesWidget = usePayFeesWidget()
const alertStore = useAlertStore()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.annualReport.title')
})

definePageMeta({
  middleware: ['filing-paid', 'require-account']
})

// options for radio buttons
const options = [
  {
    label: t('page.annualReport.form.agmStatus.opt1', { year: busStore.currentBusiness.nextARYear }),
    value: 'option-1'
  },
  {
    label: t('page.annualReport.form.agmStatus.opt2', { year: busStore.currentBusiness.nextARYear }),
    value: 'option-2'
  },
  {
    label: t('page.annualReport.form.agmStatus.opt3', { year: busStore.currentBusiness.nextARYear }),
    value: 'option-3'
  }
]

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)
const checkboxRef = ref<InstanceType<typeof UCheckbox> | null>(null)
const tooltipRef = ref<InstanceType<typeof UTooltip> | null>(null)
const selectedRadio = ref<string | null>(null)

// form state
const arData = reactive<{ agmDate: string | null, voteDate: string | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  voteDate: null,
  officeAndDirectorsConfirmed: false
})

// validate form based on the selected radio value
const validate = (state: { agmDate: string | null, voteDate: string | null, officeAndDirectorsConfirmed: boolean }): FormError[] => {
  const errors: FormError[] = []

  switch (selectedRadio.value) {
    case null: // add general error if no radio selected
      errors.push({ path: 'radioGroup', message: t('page.annualReport.form.agmStatus.error') })
      break

    case 'option-1': // add agm date field error if selected option-1
      if (!state.agmDate) {
        errors.push({ path: 'agmDate', message: t('page.annualReport.form.agmDate.error') })
      }
      break

    case 'option-2': // no error for option-2
      break

    case 'option-3': // add vote date field error if selected option-3
      if (!state.voteDate) {
        errors.push({ path: 'voteDate', message: t('page.annualReport.form.voteDate.error') })
      }
      break

    default:
      break
  }
  return errors
}

// separate checkbox validation method, cant include in validate prop on UForm
function handleCertifyCheckboxValidation () {
  let isChecked = true
  if (!arData.officeAndDirectorsConfirmed) { // push checkbox error to form ref
    arFormRef.value?.setErrors([{ path: 'officeAndDirectorsConfirmed', message: t('page.annualReport.form.certify.error') }])
    isChecked = false
  }
  if (arFormRef.value?.errors.length === 1) { // move focus to checkbox if its the only form error
    const element = document.getElementById(checkboxRef.value?.inputId)
    element?.focus()
    element?.scrollIntoView()
  }
  return isChecked
}

// handle submitting filing and directing to pay screen
async function submitAnnualReport (event: FormSubmitEvent<any>) {
  arFormRef.value?.clear() // reset form errors
  try {
    arStore.loading = true
    if (!handleCertifyCheckboxValidation()) { // validate certification checkbox is checked
      return
    }
    // set data based off radio option
    const arFiling: ARFiling = {
      agmDate: selectedRadio.value === 'option-1' ? event.data.agmDate : null,
      votedForNoAGM: selectedRadio.value === 'option-3',
      unanimousResolutionDate: selectedRadio.value === 'option-3' ? event.data.voteDate : null
    }

    // submit filing
    const { paymentToken, filingId, payStatus } = await arStore.submitAnnualReportFiling(arFiling)
    if (payStatus === 'PAID') { // redirect to final page if payStatus comes back as paid (PAD accounts)
      return navigateTo(localePath(`/submitted?filing_id=${filingId}`))
    } else {
      // redirect to pay with the returned token and filing id
      await handlePaymentRedirect(paymentToken, filingId)
    }
  } catch {
  } finally {
    arStore.loading = false
  }
}

// focus errored field
function onError (event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// clear checkbox error text after interacting with the checkbox
watch(
  () => arData.officeAndDirectorsConfirmed,
  (newVal) => {
    if (newVal) {
      arFormRef.value?.clear('officeAndDirectorsConfirmed')
    }
  }
)

// reset form state any time the radio option changes
watch(selectedRadio, (newVal) => {
  if (newVal) {
    arData.agmDate = null
    arData.voteDate = null
    arData.officeAndDirectorsConfirmed = false
  }
})

// init page state in setup lifecycle
if (import.meta.client) {
  alertStore.$reset() // reset alerts when page mounts
  try {
    pageLoading.value = true
    // load fees for fee widget, might move into earlier setup
    addBarPayFees()
    // try to prefill form if a filing exists
    if (Object.keys(arStore.arFiling).length !== 0) {
      // add payment error message if pay status exists and doesnt equal paid
      if (arStore.arFiling.filing.header.status && arStore.arFiling.filing.header.status !== 'PAID') {
        alertStore.addAlert({
          severity: 'error',
          category: AlertCategory.PAYMENT_ERROR
        })
      }

      // set radio option and prefill date inputs
      const votedForNoAGM = arStore.arFiling.filing.annualReport.votedForNoAGM
      const agmDate = arStore.arFiling.filing.annualReport.annualGeneralMeetingDate
      const voteDate = arStore.arFiling.filing.annualReport.unanimousResolutionDate
      if (votedForNoAGM) {
        selectedRadio.value = 'option-3'
        await nextTick() // wait for dom update so input exists before setting date
        arData.voteDate = voteDate
      } else if (!votedForNoAGM && !agmDate) {
        selectedRadio.value = 'option-2'
      } else if (agmDate) {
        selectedRadio.value = 'option-1'
        await nextTick() // wait for dom update so input exists before setting date
        arData.agmDate = agmDate
      }
    }
  } catch { // silently handle errors
  } finally {
    pageLoading.value = false
  }
}
</script>
<template>
  <ClientOnly>
    <div v-show="!pageLoading" class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left sm:gap-4 md:flex-row md:gap-6">
      <div class="flex w-full flex-col gap-6">
        <SbcPageSectionH1 :heading="$t('page.annualReport.h1', { year: busStore.currentBusiness.nextARYear})" />

        <SbcAlert
          :show-on-category="[
            AlertCategory.INTERNAL_SERVER_ERROR,
            AlertCategory.PAYMENT_ERROR,
            AlertCategory.AR_SUBMIT_ERROR
          ]"
        />

        <SbcPageSectionCard
          :heading="$t('page.annualReport.h2', { name: busStore.currentBusiness.legalName })"
        >
          <SbcBusinessInfo
            break-value="lg"
            :items="[
              { label: $t('labels.busName'), value: busStore.currentBusiness.legalName },
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
            <UFormGroup name="radioGroup">
              <template #label>
                <div class="flex items-start gap-1">
                  <span>{{ $t('page.annualReport.form.agmStatus.question', { year: busStore.currentBusiness.nextARYear }) }}</span>
                  <!-- TODO: investigate better i18n/mobile tooltip options -->
                  <UTooltip
                    ref="tooltipRef"
                    :text="$t('page.annualReport.form.agmStatus.tooltip')"
                    :popper="{ arrow: true, placement: 'auto' }"
                    tabindex="0"
                    @focus="() => tooltipRef?.onMouseEnter()"
                    @blur="() => tooltipRef?.onMouseLeave()"
                  >
                    <UIcon
                      name="i-mdi-info-outline"
                      class="size-6 shrink-0 text-bcGovColor-activeBlue [@media(pointer:coarse)]:hidden"
                    />
                  </UTooltip>
                </div>
              </template>

              <URadioGroup
                v-model="selectedRadio"
                :legend="$t('page.annualReport.form.agmStatus.question', { year: busStore.currentBusiness.nextARYear })"
                :options
                :ui="{ fieldset: 'space-y-2', legend: 'sr-only' }"
                :ui-radio="{ label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200', wrapper: 'relative flex items-center' }"
              />
            </UFormGroup>

            <!-- leaving out the transition for now -->
            <!-- <Transition name="slide-up" mode="out-in"> -->
            <!-- AGM Date -->
            <UFormGroup
              v-if="selectedRadio && selectedRadio === 'option-1'"
              name="agmDate"
              class="mt-4"
              :help="$t('page.annualReport.form.agmDate.format')"
              :ui="{ help: 'text-bcGovColor-midGray' }"
            >
              <SbcInputsDateSelect
                id="date-select-agm"
                :max-date="new Date()"
                :placeholder="$t('page.annualReport.form.agmDate.placeholder')"
                :arialabel="$t('page.annualReport.form.agmDate.label')"
                :initial-date="arData.agmDate ? dateStringToDate(arData.agmDate) : undefined"
                :variant="handleFormInputVariant('agmDate', arFormRef?.errors)"
                @selection="(e) => {
                  arFormRef?.clear()
                  arData.agmDate = dateToString(e!, 'YYYY-MM-DD')}"
              />
            </UFormGroup>

            <!-- did not hold agm warning -->
            <UAlert
              v-else-if="selectedRadio && selectedRadio === 'option-2'"
              icon="i-mdi-warning"
              variant="subtle"
              color="red"
              :ui="{ description: 'mt-1 text-sm leading-4 opacity-90 text-bcGovColor-midGray', variant: { subtle: 'ring-2' }, rounded: 'rounded-none' }"
            >
              <template #description>
                <SbcI18nBold translation-path="page.annualReport.form.complianceWarning" />
              </template>
            </UAlert>

            <!-- Unanimous vote date -->
            <UFormGroup
              v-else-if="selectedRadio && selectedRadio === 'option-3'"
              name="voteDate"
              class="mt-4"
              :help="$t('page.annualReport.form.voteDate.format')"
              :ui="{ help: 'text-bcGovColor-midGray' }"
            >
              <SbcInputsDateSelect
                id="date-select-vote"
                :max-date="new Date()"
                :placeholder="$t('page.annualReport.form.voteDate.placeholder')"
                :arialabel="$t('page.annualReport.form.voteDate.label')"
                :initial-date="arData.voteDate ? dateStringToDate(arData.voteDate) : undefined"
                :variant="handleFormInputVariant('voteDate', arFormRef?.errors)"
                @selection="(e) => {
                  arFormRef?.clear()
                  arData.voteDate = dateToString(e!, 'YYYY-MM-DD')}"
              />
            </UFormGroup>
            <!-- </Transition> -->
          </UForm>
        </SbcPageSectionCard>

        <h2 class="text-lg font-semibold text-bcGovColor-darkGray">
          {{ $t('page.annualReport.reviewAndConfirm') }}
        </h2>

        <SbcPageSectionCard
          :heading="$t('words.addresses')"
          heading-icon="i-mdi-map-marker"
          heading-level="h3"
        >
          <SbcTableAddress :offices="busStore.fullDetails.offices" />
        </SbcPageSectionCard>

        <SbcPageSectionCard
          :heading="$t('words.directors')"
          heading-icon="i-mdi-account-multiple-plus"
          heading-level="h3"
        >
          <SbcTableDirectors :directors="busStore.fullDetails.parties" />
        </SbcPageSectionCard>

        <SbcPageSectionCard
          :heading="$t('words.confirm')"
          heading-icon="i-mdi-text-box-check"
          heading-level="h3"
        >
          <UFormGroup
            :ui="{
              help: 'mt-2 text-red-500',
            }"
            :help="arFormRef?.errors.some((error: FormError) => error.path === 'officeAndDirectorsConfirmed') ? $t('page.annualReport.form.certify.error') : ''"
          >
            <UCheckbox
              ref="checkboxRef"
              v-model="arData.officeAndDirectorsConfirmed"
            >
              <template #label>
                <span>{{ $t('words.i') }}</span>
                <span class="mx-1 font-semibold">{{ parseSpecialChars(keycloak.kcUser.value.fullName, 'USER').toLocaleUpperCase($i18n.locale) }}</span>
                <span>{{ $t('page.annualReport.form.certify.question') }}</span>
              </template>
            </UCheckbox>
          </UFormGroup>
        </SbcPageSectionCard>
      </div>
      <SbcFeeWidget
        class="sm:mt-2"
        :fees="payFeesWidget.fees"
        :is-loading="arStore.loading"
        @submit="arFormRef?.submit()"
      />
    </div>
  </ClientOnly>
</template>
<!-- <style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.1s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style> -->
