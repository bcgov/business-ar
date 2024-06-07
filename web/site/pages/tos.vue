<script setup lang="ts">
import type { FormError, FormSubmitEvent, FormErrorEvent } from '#ui/types'
import { UCheckbox, UForm } from '#components'
const localePath = useLocalePath()
const pageLoading = useState('page-loading')
const tosStore = useTosStore()

definePageMeta({
})

const checkboxRef = ref<InstanceType<typeof UCheckbox>>(null)
const formRef = ref<InstanceType<typeof UForm>>(null)
const tosDivRef = ref<HTMLDivElement | null>(null)

const { bottom: tosBottom } = useElementBounding(tosDivRef)
const { top: formTop } = useElementBounding(formRef)

const hasReachedBottom = computed(() => formTop.value >= tosBottom.value)

watch(hasReachedBottom, (newVal) => {
  if (newVal) {
    formRef.value?.clear()
  }
})

const state = reactive({
  agreeToTerms: undefined
})

const validate = (state: { agreeToTerms: boolean | undefined }): FormError[] => {
  const errors: FormError[] = []

  if (!state.agreeToTerms && !hasReachedBottom.value) {
    errors.push({ path: 'agreeToTerms', message: 'Please scroll to the bottom of the document to accept the Terms of Use' })
    return errors
  }

  if (!state.agreeToTerms) {
    errors.push({ path: 'agreeToTerms', message: 'You must accept the Terms of Use to continue' })
  }

  return errors
}

if (import.meta.client) {
  await tosStore.getTermsOfUse()
  pageLoading.value = false
}
</script>
<template>
  <ClientOnly>
    <div class="relative -mb-4 flex w-full flex-col items-center sm:max-w-screen-sm md:max-w-screen-md">
      <SbcPageSectionH1 heading="Terms of Use" />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="tosStore.tos.termsOfUse" ref="tosDivRef" class="prose prose-bcGov max-w-full break-words" v-html="tosStore.tos.termsOfUse" />
      <UForm
        ref="formRef"
        class="sticky bottom-0 flex w-full flex-col items-center justify-between gap-4 border-t border-bcGovGray-500 bg-bcGovColor-gray1 py-4 sm:flex-row sm:gap-0"
        :state
        :validate="validate"
        @submit="tosStore.submitTermsOfUse($event, () => navigateTo(localePath('/')))"
      >
        <UFormGroup
          name="agreeToTerms"
          :class="[
            !hasReachedBottom && !state.agreeToTerms ? 'mb-2' : '',
            !hasReachedBottom && formRef?.errors.length === 0 && !state.agreeToTerms ? '-mt-8 sm:-mt-0' : ''
          ]"
        >
          <UCheckbox
            v-if="hasReachedBottom || state.agreeToTerms"
            ref="checkboxRef"
            v-model="state.agreeToTerms"
            class="mt-1 self-start sm:self-auto"
            label="I have read and accept the Terms of Use"
          />
          <template #error="{ error }">
            <span
              :class="[
                error ? 'text-red-500' : '',
                !hasReachedBottom ? 'text-base' : '',
              ]"
            >
              <span v-if="!hasReachedBottom"> {{ error }}</span>
              <span v-else> {{ error }}</span>
            </span>
          </template>
        </UFormGroup>
        <div class="ml-auto flex w-full gap-4 sm:w-min">
          <UButton
            class="flex-1 sm:flex-none"
            :ui="{ base: 'flex justify-center items-center'}"
            label="Accept"
            type="submit"
          />
          <UButton
            class="flex-1 sm:flex-none"
            :ui="{ base: 'flex justify-center items-center'}"
            label="Decline"
            variant="outline"
            @click="() => console.log('decline terms of use')"
          />
        </div>
      </UForm>
    </div>
  </ClientOnly>
</template>
