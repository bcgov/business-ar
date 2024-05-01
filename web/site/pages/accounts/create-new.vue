<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { z } from 'zod'
import { UForm } from '#components'
// const localePath = useLocalePath()
const { t } = useI18n()
const accountStore = useAccountStore()
const accountFormRef = ref<InstanceType<typeof UForm> | null>(null)
const accountFormErrors = ref<Array<{path: string, message: string}> | null>(null)
const formLoading = ref(false)
const keycloak = useKeycloak()

useHead({
  title: t('page.createAccount.title')
})

const accountDetails = reactive({
  accountName: undefined,
  contact: {
    phone: undefined,
    phoneExt: undefined,
    email: undefined
  }
})

const accountSchema = z.object({
  accountName: z.string({ required_error: 'Please enter an Account Name' }).min(2, 'Account Name must be at least 2 characters'),
  contact: z.object({
    phone: z.string({ required_error: 'Please enter a Phone Number' }),
    phoneExt: z.string().optional(),
    email: z.string({ required_error: 'Please enter an Email Address' }).email({ message: 'Please enter a valid email address' })
  })
})

type FormSchema = z.output<typeof accountSchema>

async function submitCreateAccountForm (event: FormSubmitEvent<FormSchema>) {
  // accountFormRef.value.clear()
  // Do something with event.data
  formLoading.value = true
  const fullData = {
    name: event.data.accountName
  }

  await accountStore.createNewAccount(fullData)
  formLoading.value = false

  // console.log('form submit')
  // console.log(event.data)
  // console.log(event)
}

async function onError (event: FormErrorEvent) {
  console.log('error: ', event)
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

watch(() => accountFormRef.value?.errors, (newVal) => {
  accountFormErrors.value = newVal
  console.log('form errors', accountFormErrors.value)
}, { deep: true })

interface FormPathError {
  path: string,
  message: string
}

function handleFormInputVariant (path: string): 'error' | 'bcGov' {
  if (accountFormErrors.value) {
    const hasError = accountFormErrors.value.some((error: FormPathError) => error.path === path)
    return hasError ? 'error' : 'bcGov'
  } else {
    return 'bcGov'
  }
}
</script>
<template>
  <div class="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-8 text-left">
    <h1 class="self-start text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.createAccount.h1') }}
    </h1>
    <UCard
      class="w-full"
      :ui="{
        header: {
          base: '',
          background: 'bg-bcGovColor-gray2',
          padding: 'px-4 py-5 sm:px-6',
        }
      }"
    >
      <template #header>
        <h2 class="font-semibold text-bcGovColor-darkGray dark:text-white">
          Primary Contact Details
        </h2>
      </template>
      <!-- display current users name -->
      <div class="flex flex-col gap-y-4 md:grid md:grid-cols-6">
        <span class="col-span-1 col-start-1 font-semibold text-bcGovColor-darkGray">Your Name</span>
        <div class="col-span-full col-start-2 flex flex-col gap-2 text-bcGovColor-midGray">
          <span> {{ parseSpecialChars(keycloak.kcUser.value.fullName, 'USER') }} </span>
          <span> This is your legal name as it appears on your BC Services Card. </span>
        </div>
      </div>

      <UDivider class="my-8" />

      <UForm
        ref="accountFormRef"
        :state="accountDetails"
        :schema="accountSchema"
        class="flex flex-col gap-y-4 md:grid md:grid-cols-6 md:gap-y-8"
        @error="onError"
        @submit="submitCreateAccountForm"
      >
        <!-- account name -->
        <span class="col-span-1 col-start-1 row-span-1 row-start-1 font-semibold text-bcGovColor-darkGray">Account Name</span>
        <UFormGroup name="accountName" class="col-span-full col-start-2 row-span-1 row-start-1">
          <UInput
            v-model="accountDetails.accountName"
            :variant="handleFormInputVariant('accountName')"
            placeholder="Account Name"
            class="placeholder:text-bcGovColor-midGray"
          />
        </UFormGroup>

        <!-- contact details -->
        <span class="col-span-1 col-start-1 row-span-1 row-start-3 mt-4 font-semibold text-bcGovColor-darkGray md:mt-0">Contact Details</span>
        <div class="col-span-full col-start-2 row-span-1 row-start-3">
          <div class="flex flex-col justify-between gap-4 md:flex-row">
            <!-- phone number -->
            <UFormGroup name="contact.phone" class="md:flex-1">
              <UInput
                v-model="accountDetails.contact.phone"
                :variant="handleFormInputVariant('contact.phone')"
                placeholder="Phone Number"
              />
            </UFormGroup>
            <!-- phone number extension -->
            <UFormGroup name="contact.phoneExt" class="md:flex-1">
              <UInput
                v-model="accountDetails.contact.phoneExt"
                :variant="handleFormInputVariant('contact.phoneExt')"
                placeholder="Extension (Optional)"
              />
            </UFormGroup>
          </div>
        </div>
        <!-- email address -->
        <UFormGroup name="contact.email" class="col-span-full col-start-2 row-span-1 row-start-4">
          <UInput
            v-model="accountDetails.contact.email"
            :variant="handleFormInputVariant('contact.email')"
            placeholder="Email Address"
          />
        </UFormGroup>

        <!-- might add this back in later -->
        <!-- mailing address -->
        <!-- <span class="col-span-1 col-start-1 row-span-1 row-start-6 mt-4 font-semibold text-bcGovColor-darkGray md:mt-0">Mailing Address</span> -->
        <!-- country -->
        <!-- <UFormGroup name="address.country" class="col-span-full col-start-2 row-span-1 row-start-6">
          <USelectMenu
            v-model="accountDetails.address.country"
            :ui-menu="{ label: 'text-gray-700' }"
            by="alpha_2"
            class="w-full"
            placeholder="Country"
            :options="countries"
            :variant="handleFormInputVariant('address.country')"
            option-attribute="name"
            data-cy="address-country"
            @change="changeCountry"
            @blur="countryBlurred = true"
          />
        </UFormGroup> -->
        <!-- address line 1 -->
        <!-- <UFormGroup name="address.line1" class="col-span-full col-start-2 row-span-1 row-start-7">
          <SbcInputsAddressLine1Autocomplete
            v-model="accountDetails.address.line1"
            :country-iso3166-alpha2="accountDetails.address.alpha_2"
            :input-variant="handleFormInputVariant('address.line1')"
            data-cy="address-line1-autocomplete"
            @addr-auto-completed="addrAutoCompleted"
          /> -->
        <!-- @blur="addressForm.validate('line1', { silent: true })" -->
        <!-- </UFormGroup> -->
        <!-- address line 2 optional -->
        <!-- <UFormGroup class="col-span-full col-start-2 row-span-1 row-start-8" name="address.line2">
          <UInput
            v-model="accountDetails.address.line2"
            :placeholder="$t('labels.line2')"
            class="w-full flex-1"
            :variant="handleFormInputVariant('address.line2')"
            data-cy="address-line2"
          />
        </UFormGroup> -->

        <!--  city; region combo; postal code -->
        <!-- <div class="col-span-full col-start-2 row-span-1 row-start-9">
          <div class="flex flex-col gap-4 md:flex-row"> -->
        <!-- city -->
        <!-- <UFormGroup class="md:flex-1" name="address.city">
              <UInput
                v-model="accountDetails.address.city"
                :placeholder="$t('labels.city')"
                type="text"
                :variant="handleFormInputVariant('address.city')"
                data-cy="address-city"
              />
            </UFormGroup> -->
        <!-- region (province/state) -->
        <!-- <UFormGroup class="md:flex-1" name="address.region">
              <USelectMenu
                v-if="accountDetails.address.country.alpha_2==='US' || accountDetails.address?.country.alpha_2==='CA'"
                v-model="accountDetails.address.region"
                :ui-menu="{ placeholder: 'text-gray-700' }"
                :options="regions"
                :placeholder="$t('labels.state')"
                :variant="handleFormInputVariant('address.region')"
                option-attribute="name"
                value-attribute="code"
                data-cy="address-region-select"
              />
              <UInput
                v-else
                v-model="accountDetails.address.postalCode"
                :placeholder="$t('labels.state')"
                :variant="handleFormInputVariant('address.region')"
                data-cy="address-region-input"
              />
            </UFormGroup> -->
        <!-- postal code -->
        <!-- <UFormGroup class="md:flex-1" name="address.postalCode">
              <UInput
                v-model="accountDetails.address.postalCode"
                :placeholder="$t('labels.postalCode')"
                type="text"
                class="w-full"
                :variant="handleFormInputVariant('address.postalCode')"
                data-cy="address-postal-code"
              />
            </UFormGroup> -->
        <!-- </div>
        </div> -->
        <!-- submit button -->
        <div class="col-span-full col-start-1 row-span-1 row-start-6">
          <div class="flex">
            <UButton
              class="ml-auto"
              :label="$t('btn.createAccount')"
              type="submit"
              :loading="formLoading"
            />
          </div>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
