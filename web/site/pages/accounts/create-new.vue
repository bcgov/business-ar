<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { z } from 'zod'
import { handleFormErrorEvent } from '~/utils/form/handleFormErrorEvent'
import { UForm, USelectMenu } from '#components'
import { isoCountriesList, countrySubdivisions } from '~/utils/validate/isoCountriesList'
import type { Iso3166_1Country, SbcCountrySubdivision } from '~/utils/validate/isoCountriesList'

const localePath = useLocalePath()
const { t } = useI18n()
const accountStore = useAccountStore()
const accountFormRef = ref<InstanceType<typeof UForm> | null>(null)
const keycloak = useKeycloak()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.createAccount.title')
})

definePageMeta({
  middleware: ['filing-paid', 'filing-in-progress']
})

const accountDetails = reactive<NewAccount>({
  accountName: undefined,
  contact: {
    phone: undefined,
    extension: undefined,
    email: undefined
  },
  mailingAddress: {
    street: undefined,
    streetAdditional: undefined,
    city: undefined,
    region: undefined,
    postalCode: undefined,
    country: 'CA',
    deliveryInstructions: undefined
  }
})

const countryOptions = isoCountriesList.map(country => ({ label: country.name, value: country.alpha_2 }))

const regionOptions = computed(() => {
  const selectedCountryCode = accountDetails.mailingAddress.country?.toLowerCase()
  if (selectedCountryCode === 'ca' || selectedCountryCode === 'us') {
    return countrySubdivisions[selectedCountryCode].map(sub => ({ label: sub.name, value: sub.code }))
  }
  return []
})

const isRegionDropdown = computed(() => {
  const selectedCountryCode = accountDetails.mailingAddress.country?.toLowerCase()
  return selectedCountryCode === 'ca' || selectedCountryCode === 'us'
})

const accountSchema = z.object({
  accountName: z.string({ required_error: t('page.createAccount.form.accountNameSection.error.req') }).min(2, t('page.createAccount.form.accountNameSection.error.min')),
  contact: z.object({
    phone: z.string({ required_error: t('page.createAccount.form.contactDetailsSection.error.phone.req') }).min(10, t('page.createAccount.form.contactDetailsSection.error.phone.invalid')).regex(/^[0-9()/ -]+$/, t('page.createAccount.form.contactDetailsSection.error.phone.invalid')),
    extension: z.string()
      .regex(/^[0-9]*$/, { message: t('page.createAccount.form.contactDetailsSection.error.phoneExt.invalid') })
      .optional(),
    email: z.string({ required_error: t('page.createAccount.form.contactDetailsSection.error.email.req') }).email({ message: t('page.createAccount.form.contactDetailsSection.error.email.invalid') })
  }),
  mailingAddress: z.object({
    street: z.string({ required_error: t('page.createAccount.form.addressSection.error.street.req') }),
    streetAdditional: z.string().optional(),
    city: z.string({ required_error: t('page.createAccount.form.addressSection.error.city.req') }),
    region: z.string().optional(),
    postalCode: z.string({ required_error: t('page.createAccount.form.addressSection.error.postalCode.req') }),
    country: z.string({ required_error: t('page.createAccount.form.addressSection.error.country.req') }),
    deliveryInstructions: z.string().optional()
  })
})

type FormSchema = z.output<typeof accountSchema>

async function submitCreateAccountForm (event: FormSubmitEvent<FormSchema>) {
  if (!isRegionDropdown.value && accountDetails.mailingAddress.region && countrySubdivisions.ca.some(p => p.code === accountDetails.mailingAddress.region) || countrySubdivisions.us.some(s => s.code === accountDetails.mailingAddress.region)) {
  }
  await accountStore.createNewAccount(event.data, () => navigateTo(localePath('/annual-report')))
}

const validate = async (state: any): Promise<FormError[]> => {
  const errors = []
  try {
    if (!state.accountName) { return [] }
    const accountAvailable = await accountStore.isAccountNameAvailable(state.accountName)
    if (!accountAvailable) {
      errors.push({ path: 'accountName', message: t('page.createAccount.form.accountNameSection.error.unique') })
    }
  } catch {
    // fail silently
  }
  if (!isRegionDropdown.value && state.mailingAddress.region && (countrySubdivisions.ca.some(p => p.code === state.mailingAddress.region) || countrySubdivisions.us.some(s => s.code === state.mailingAddress.region))) {
  }

  return errors
}

watch(() => accountDetails.mailingAddress.country, (newCountry, oldCountry) => {
  const oldCountryCode = oldCountry?.toLowerCase()
  const newCountryCode = newCountry?.toLowerCase()

  const wasDropdown = oldCountryCode === 'ca' || oldCountryCode === 'us'
  const isNowDropdown = newCountryCode === 'ca' || newCountryCode === 'us'

  if (wasDropdown && !isNowDropdown) {
    accountDetails.mailingAddress.region = undefined
    accountFormRef.value?.validate('mailingAddress.region', { silent: true })
  }
  else if (!wasDropdown && isNowDropdown) {
    accountDetails.mailingAddress.region = undefined
    accountFormRef.value?.validate('mailingAddress.region', { silent: true })
  }
})

if (import.meta.client) {
  try {
    const name = parseSpecialChars(keycloak.kcUser.value.fullName, '')
    accountDetails.accountName = await accountStore.findAvailableAccountName(name)
  } catch (e) {
    console.error(`Could not prefill account name: ${e}`)
  } finally {
    pageLoading.value = false
  }
}
</script>
<template>
  <ClientOnly>
    <div class="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-8 text-left">
      <SbcPageSectionH1
        class="self-start"
        :heading="$t('page.createAccount.h1')"
      />

      <SbcAlert
        :show-on-category="[
          AlertCategory.CREATE_ACCOUNT,
          AlertCategory.INTERNAL_SERVER_ERROR
        ]"
      />

      <SbcPageSectionCard
        :heading="$t('page.createAccount.h2')"
      >
        <div class="flex flex-col gap-y-4 md:grid md:grid-cols-6">
          <span class="col-span-1 col-start-1 font-semibold text-bcGovColor-darkGray">{{ $t('page.createAccount.form.infoSection.fieldSet') }}</span>
          <div class="col-span-full col-start-2 flex flex-col gap-2 text-bcGovColor-midGray">
            <span> {{ parseSpecialChars(keycloak.kcUser.value.fullName, 'USER') }} </span>
            <span> {{ $t('page.createAccount.form.infoSection.info') }} </span>
          </div>
        </div>

        <UDivider class="my-8" />

        <UForm
          ref="accountFormRef"
          :state="accountDetails"
          :schema="accountSchema"
          :validate="validate"
          class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-8"
          @error="handleFormErrorEvent"
          @submit="submitCreateAccountForm"
        >
          <span aria-hidden="true" class="col-span-1 col-start-1 row-span-1 row-start-1 font-semibold text-bcGovColor-darkGray">{{ $t('page.createAccount.form.accountNameSection.fieldSet') }}</span>
          <UFormGroup name="accountName" class="col-span-full col-start-2 row-span-1 row-start-1">
            <UInput
              v-model="accountDetails.accountName"
              :variant="handleFormInputVariant('accountName', accountFormRef?.errors)"
              :aria-label="$t('page.createAccount.form.accountNameSection.accountNameInputLabel')"
              :placeholder="$t('page.createAccount.form.accountNameSection.accountNameInputLabel')"
              class="placeholder:text-bcGovColor-midGray"
            />
          </UFormGroup>

          <span aria-hidden="true" class="col-span-1 col-start-1 row-span-1 row-start-3 mt-4 font-semibold text-bcGovColor-darkGray md:mt-0">{{ $t('page.createAccount.form.contactDetailsSection.fieldSet') }}</span>
          <div class="col-span-full col-start-2 row-span-1 row-start-3">
            <div class="flex flex-col justify-between gap-4 md:flex-row">
              <UFormGroup name="contact.phone" class="md:flex-1">
                <UInput
                  v-model="accountDetails.contact.phone"
                  :variant="handleFormInputVariant('contact.phone', accountFormRef?.errors)"
                  :placeholder="$t('page.createAccount.form.contactDetailsSection.phoneInputLabel')"
                  :aria-label="$t('page.createAccount.form.contactDetailsSection.phoneInputLabel')"
                />
              </UFormGroup>
              <UFormGroup name="contact.extension" class="md:flex-1">
                <UInput
                  v-model="accountDetails.contact.extension"
                  :variant="handleFormInputVariant('contact.extension', accountFormRef?.errors)"
                  :placeholder="t('page.createAccount.form.contactDetailsSection.phoneExtInputLabel.main')"
                  :aria-label="t('page.createAccount.form.contactDetailsSection.phoneExtInputLabel.aria')"
                  @input="validateNumericInput"
                />
                <div v-if="accountFormRef?.errors['contact.extension']" class="mt-1 text-sm text-red-500">
                  {{ accountFormRef.errors['contact.extension'] }}
                </div>
              </UFormGroup>
            </div>
          </div>
          <UFormGroup name="contact.email" class="col-span-full col-start-2 row-span-1 row-start-4">
            <UInput
              v-model="accountDetails.contact.email"
              :variant="handleFormInputVariant('contact.email', accountFormRef?.errors)"
              :placeholder="$t('page.createAccount.form.contactDetailsSection.emailInputLabel')"
              :aria-label="$t('page.createAccount.form.contactDetailsSection.emailInputLabel')"
            />
          </UFormGroup>

          <span aria-hidden="true" class="col-span-1 col-start-1 row-span-1 row-start-5 mt-4 font-semibold text-bcGovColor-darkGray md:mt-0">{{ $t('page.createAccount.form.addressSection.fieldSet') }}</span>
          <div class="col-span-full col-start-2 row-span-1 row-start-5">
            <div class="flex flex-col gap-4">
              <UFormGroup name="mailingAddress.street">
                <UInput
                  v-model="accountDetails.mailingAddress.street"
                  :variant="handleFormInputVariant('mailingAddress.street', accountFormRef?.errors)"
                  :placeholder="$t('page.createAccount.form.addressSection.streetInputLabel')"
                  :aria-label="$t('page.createAccount.form.addressSection.streetInputLabel')"
                />
              </UFormGroup>

              <UFormGroup name="mailingAddress.streetAdditional">
                <UInput
                  v-model="accountDetails.mailingAddress.streetAdditional"
                  :variant="handleFormInputVariant('mailingAddress.streetAdditional', accountFormRef?.errors)"
                  :placeholder="$t('page.createAccount.form.addressSection.streetAdditionalInputLabel')"
                  :aria-label="$t('page.createAccount.form.addressSection.streetAdditionalInputLabel')"
                />
              </UFormGroup>

              <div class="flex flex-col justify-between gap-4 md:flex-row">
                <UFormGroup name="mailingAddress.city" class="md:flex-1">
                  <UInput
                    v-model="accountDetails.mailingAddress.city"
                    :variant="handleFormInputVariant('mailingAddress.city', accountFormRef?.errors)"
                    :placeholder="$t('page.createAccount.form.addressSection.cityInputLabel')"
                    :aria-label="$t('page.createAccount.form.addressSection.cityInputLabel')"
                  />
                </UFormGroup>

                <UFormGroup name="mailingAddress.region" class="md:flex-1">
                  <USelectMenu
                    v-if="isRegionDropdown"
                    v-model="accountDetails.mailingAddress.region"
                    :options="regionOptions"
                    value-attribute="value"
                    option-attribute="label"
                    searchable
                    :placeholder="$t('page.createAccount.form.addressSection.regionSelectPlaceholder')"
                    :aria-label="$t('page.createAccount.form.addressSection.regionSelectPlaceholder')"
                    :variant="handleFormInputVariant('mailingAddress.region', accountFormRef?.errors)"
                  />
                  <UInput
                    v-else
                    v-model="accountDetails.mailingAddress.region"
                    :variant="handleFormInputVariant('mailingAddress.region', accountFormRef?.errors)"
                    :placeholder="$t('page.createAccount.form.addressSection.regionInputLabel')"
                    :aria-label="$t('page.createAccount.form.addressSection.regionInputLabel')"
                  />
                </UFormGroup>
              </div>

              <div class="flex flex-col justify-between gap-4 md:flex-row">
                <UFormGroup name="mailingAddress.postalCode" class="md:flex-1">
                  <UInput
                    v-model="accountDetails.mailingAddress.postalCode"
                    :variant="handleFormInputVariant('mailingAddress.postalCode', accountFormRef?.errors)"
                    :placeholder="$t('page.createAccount.form.addressSection.postalCodeInputLabel')"
                    :aria-label="$t('page.createAccount.form.addressSection.postalCodeInputLabel')"
                  />
                </UFormGroup>

                <UFormGroup name="mailingAddress.country" class="md:flex-1">
                  <USelectMenu
                    v-model="accountDetails.mailingAddress.country"
                    :options="countryOptions"
                    value-attribute="value"
                    option-attribute="label"
                    searchable
                    :placeholder="$t('page.createAccount.form.addressSection.countrySelectPlaceholder')"
                    :aria-label="$t('page.createAccount.form.addressSection.countrySelectPlaceholder')"
                    :variant="handleFormInputVariant('mailingAddress.country', accountFormRef?.errors)"
                  />
                </UFormGroup>
              </div>

              <UFormGroup name="mailingAddress.deliveryInstructions">
                <UInput
                  v-model="accountDetails.mailingAddress.deliveryInstructions"
                  :variant="handleFormInputVariant('mailingAddress.deliveryInstructions', accountFormRef?.errors)"
                  :placeholder="$t('page.createAccount.form.addressSection.deliveryInstructionsInputLabel')"
                  :aria-label="$t('page.createAccount.form.addressSection.deliveryInstructionsInputLabel')"
                />
              </UFormGroup>
            </div>
          </div>

          <div class="col-span-full col-start-1 row-span-1 row-start-7">
            <div class="flex">
              <UButton
                class="ml-auto"
                :label="$t('btn.saveAccountAndFileAr')"
                type="submit"
                :loading="accountStore.loading"
              />
            </div>
          </div>
        </UForm>
      </SbcPageSectionCard>
    </div>
  </ClientOnly>
</template>
