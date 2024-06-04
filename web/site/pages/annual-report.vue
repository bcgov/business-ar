<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UForm, UCheckbox, SbcInputsDateSelect, UTooltip } from '#components'
const { t } = useI18n()
const localePath = useLocalePath()
const keycloak = useKeycloak()
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
const dateSelectRef = ref<InstanceType<typeof SbcInputsDateSelect> | null>(null)
const selectedRadio = ref<string | null>(null)
const loading = ref<boolean>(false)
const errorAlert = reactive({
  title: '',
  description: ''
})
const showCheckboxHelp = ref(false)

// form state
const arData = reactive<{ agmDate: string | null, voteDate: string | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  voteDate: null,
  officeAndDirectorsConfirmed: false
})

// validate the date field and show error if the 'Yes' radio is selected
const validate = (state: any): FormError[] => {
  const errors = []
  // if yes to agm, user must input a date
  if (selectedRadio.value === 'option-1' && !state.agmDate) {
    errors.push({ path: 'agmDate', message: t('page.annualReport.form.agmDate.error') })
  }
  return errors
}

// handle submitting filing and directing to pay screen
async function submitAnnualReport (event: FormSubmitEvent<any>) {
  arFormRef.value?.clear() // reset form errors
  arStore.errors = [] // reset errors
  errorAlert.title = ''
  errorAlert.description = ''
  try {
    // check if confirmation checkbox was selected
    if (!arData.officeAndDirectorsConfirmed) {
      showCheckboxHelp.value = true // display error message
      if (arFormRef.value?.errors.length === 0) { // only scroll into view if no other errors
        const element = document.getElementById(checkboxRef.value?.inputId)
        element?.focus()
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return // cancel form submission if not checked
    }
    loading.value = true
    // set data based off radio button value
    const arFiling: ARFiling = {
      agmDate: selectedRadio.value === 'option-1' ? event.data.agmDate : null,
      votedForNoAGM: selectedRadio.value === 'option-3'
    }
    // submit filing
    const { paymentToken, filingId, payStatus } = await arStore.submitAnnualReportFiling(arFiling)
    if (payStatus === 'PAID') {
      return navigateTo(localePath(`/submitted?filing_id=${filingId}`))
    } else {
      // redirect to pay with the returned token and filing id
      await handlePaymentRedirect(paymentToken, filingId)
    }
  } catch {
    // display error
    errorAlert.description = arStore.errors[0].message
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

// set/unset checkbox error text after interacting with the checkbox
watch(
  () => arData.officeAndDirectorsConfirmed,
  (newVal) => {
    if (newVal === true) {
      showCheckboxHelp.value = false
    } else {
      showCheckboxHelp.value = true
    }
  }
)

// init page state
if (import.meta.client) {
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
}

// fix premature validation of final checkbox
</script>
<template>
  <ClientOnly>
    <div v-show="!loadStore.pageLoading" class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left sm:gap-4 md:flex-row md:gap-6">
      <div class="flex w-full flex-col gap-6">
        <SbcPageSectionH1 :heading="$t('page.annualReport.h1', { year: busStore.currentBusiness.nextARYear})" />

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
            <!-- TODO: look into why this label isnt being associated with the radios -->
            <UFormGroup name="radioGroup">
              <template #label>
                <div class="flex items-start gap-1">
                  <span>{{ $t('page.annualReport.form.agmStatus.question', { year: busStore.currentBusiness.nextARYear }) }}</span>
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
                      class="size-6 shrink-0 text-bcGovColor-activeBlue"
                    />
                  </UTooltip>
                </div>
              </template>

              <URadioGroup v-model="selectedRadio" :options :ui="{ fieldset: 'space-y-2' }" :ui-radio="{ label: 'text-base font-medium text-bcGovColor-midGray dark:text-gray-200'}" />
            </UFormGroup>

            <!-- AGM Date -->
            <UFormGroup
              v-if="selectedRadio && selectedRadio === 'option-1'"
              name="agmDate"
              class="mt-4"
              :help="$t('page.annualReport.form.agmDate.format')"
              :ui="{ help: 'text-bcGovColor-midGray' }"
            >
              <SbcInputsDateSelect
                id="SelectAGMDate"
                ref="dateSelectRef"
                :max-date="new Date()"
                :placeholder="$t('page.annualReport.form.agmDate.placeholder')"
                :arialabel="$t('page.annualReport.form.agmDate.label')"
                :initial-date="arData.agmDate ? dateStringToDate(arData.agmDate) : undefined"
                variant="bcGov"
                @selection="(e) => {
                  arFormRef?.clear()
                  arData.agmDate = dateToString(e!, 'YYYY-MM-DD')}"
              />
            </UFormGroup>

            <!-- Unanimous vote date -->
            <UFormGroup
              v-if="selectedRadio && selectedRadio === 'option-2'"
              name="voteDate"
              class="mt-4"
              :help="$t('page.annualReport.form.voteDate.format')"
              :ui="{ help: 'text-bcGovColor-midGray' }"
            >
              <SbcInputsDateSelect
                id="SelectVoteDate"
                ref="dateSelectRef"
                :max-date="new Date()"
                :placeholder="$t('page.annualReport.form.voteDate.placeholder')"
                :arialabel="$t('page.annualReport.form.voteDate.label')"
                :initial-date="arData.voteDate ? dateStringToDate(arData.voteDate) : undefined"
                variant="bcGov"
                @selection="(e) => {
                  arFormRef?.clear()
                  arData.voteDate = dateToString(e!, 'YYYY-MM-DD')}"
              />
            </UFormGroup>

            <UAlert title="test" />

            <!-- <SbcAlert :show-on-category="" /> -->
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
            :help="showCheckboxHelp ? $t('page.annualReport.form.certify.error') : ''"
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
        :is-loading="loading"
        @submit="arFormRef?.submit()"
      />
    </div>
  </ClientOnly>
</template>
