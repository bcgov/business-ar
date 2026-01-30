<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { handleFormErrorEvent } from '~/utils/form/handleFormErrorEvent'
import { UCheckbox, UForm } from '#components'
const { t } = useI18n()
const localePath = useLocalePath()
const keycloak = useKeycloak()
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const feeStore = usePayFeesStore()
const alertStore = useAlertStore()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.annualReport.title')
})

definePageMeta({
  middleware: ['filing-paid', 'require-account']
})

// options for radio buttons

const arFormRef = ref<InstanceType<typeof UForm> | null>(null)
const checkboxRef = ref<InstanceType<typeof UCheckbox> | null>(null)

// Mobile View dropdowns
const isMobile = ref(false)
const showAddressesRef = ref<boolean>(true)
const showDirectorsRef = ref<boolean>(true)

// form state
const arData = reactive<{ agmDate: Date | null, voteDate: Date | null, officeAndDirectorsConfirmed: boolean}>({
  agmDate: null,
  voteDate: null,
  officeAndDirectorsConfirmed: false
})

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
async function submitAnnualReport (_event: FormSubmitEvent<any>) {
  arFormRef.value?.clear() // reset form errors
  try {
    arStore.loading = true
    if (!handleCertifyCheckboxValidation()) { // validate certification checkbox is checked
      return
    }
    // set data based off radio option
    const arFiling: ArFormData = {
      agmDate: null,
      votedForNoAGM: arStore.arFiling.filing.annualReport.votedForNoAGM,
      unanimousResolutionDate: arStore.arFiling.filing.annualReport.unanimousResolutionDate
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

// Compute latest next AR date as a string
const nextArDate = computed(() => {
  if (busStore.nextArDate) {
    const date = new Date(busStore.nextArDate)
    return !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null
  }
  return null
})

// clear form errors anytime data changes
watch(
  () => arData,
  (newVal) => {
    if (newVal) {
      arFormRef.value?.clear()
    }
  }, { deep: true }
)

function handleResize () {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// init page state in setup lifecycle
if (import.meta.client) {
  try {
    // load fees for fee widget, might move into earlier setup
    await feeStore.initAlternatePaymentMethod()
    feeStore.addPayFees('BCANN')

    // try to prefill form if a filing exists
    if (Object.keys(arStore.arFiling).length !== 0) {
      // add payment error message if pay status exists and doesnt equal paid
      if (arStore.arFiling.filing.header.status && arStore.arFiling.filing.header.status !== 'PAID') {
        alertStore.addAlert({
          severity: 'error',
          category: AlertCategory.PAYMENT_ERROR
        })
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
    <div v-show="!pageLoading" class="relative mx-auto flex w-full flex-col gap-4 text-left md:w-4/5 lg:flex-row lg:gap-6 xl:w-3/4">
      <div class="flex w-full flex-col gap-6">
        <SbcPageSectionH1
          :heading="$t('page.annualReport.h1', { year: busStore.nextArYear})"
        />

        <SbcAlert
          :show-on-category="[
            AlertCategory.INTERNAL_SERVER_ERROR,
            AlertCategory.PAYMENT_ERROR,
            AlertCategory.AR_SUBMIT_ERROR,
            AlertCategory.FEE_INFO
          ]"
        />

        <SbcPageSectionCard
          :heading="$t('page.annualReport.h2', { name: busStore.currentBusiness.legalName })"
        >
          <SbcBusinessInfo
            break-value="lg"
            :items="[
              { label: $t('labels.busName'), value: busStore.currentBusiness.legalName },
              { label: $t('labels.corpNum'), value: `${busStore.businessNano.legalType}${busStore.businessNano.identifier.replace(/\D/g, '')}`},
              { label: $t('labels.arDate'), value: nextArDate },
            ]"
            :is-selecting-filing="false"
            :is-authenticated="keycloak.isAuthenticated()"
          />

          <UForm
            ref="arFormRef"
            :state="arData"
            autocomplete="off"
            class="space-y-6"
            @submit="submitAnnualReport"
            @error="handleFormErrorEvent"
          />
        </SbcPageSectionCard>

        <h2 class="text-lg font-semibold text-bcGovColor-darkGray">
          {{ $t('page.annualReport.reviewAndConfirm.main') }}
          <SbcTooltip :text="$t('page.annualReport.reviewAndConfirm.help')" />
        </h2>

        <SbcPageSectionCard
          :heading="$t('words.addresses')"
          heading-icon="i-mdi-map-marker"
          heading-level="h3"
          :is-mobile="isMobile"
          :show-content="showAddressesRef"
          @toggle-content="showAddressesRef = !showAddressesRef"
        >
          <SbcTableAddress v-if="showAddressesRef || !isMobile" :offices="busStore.fullDetails.offices" />
        </SbcPageSectionCard>

        <SbcPageSectionCard
          :heading="$t('words.directors')"
          heading-icon="i-mdi-account-multiple-plus"
          heading-level="h3"
          :is-mobile="isMobile"
          :show-content="showDirectorsRef"
          @toggle-content="showDirectorsRef = !showDirectorsRef"
        >
          <SbcTableDirectors v-if="showDirectorsRef || !isMobile" :directors="busStore.fullDetails.parties" />
        </SbcPageSectionCard>

        <SbcPageSectionCard
          :heading="$t('words.confirm')"
          heading-icon="i-mdi-text-box-check"
          heading-level="h3"
          :is-mobile="isMobile"
          :show-content="undefined"
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
                <SbcI18nBold translation-path="page.annualReport.form.certify.question" :name="parseSpecialChars(keycloak.kcUser.value.fullName, 'USER').toLocaleUpperCase($i18n.locale)" />
              </template>
            </UCheckbox>
          </UFormGroup>
        </SbcPageSectionCard>
      </div>
      <SbcFeeWidget
        class="md:sticky md:top-10 md:mt-1 md:self-start"
        :fees="feeStore.fees"
        :is-loading="arStore.loading"
        @submit="arFormRef?.submit()"
      />
    </div>
  </ClientOnly>
</template>
