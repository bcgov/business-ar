<script lang="ts">
// only load these once
import {
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth'

export const bcscAuthProvider = new OAuthProvider('oidc.keycloak-bcsc')
</script>
<script setup lang="ts">
const auth = useFirebaseAuth()! // only exists on client side
const error = ref<Error | null>(null)
const user = useCurrentUser()
// const localePath = useLocalePath()
const { t, locale } = useI18n()

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

const { data: arRequirements } = await useAsyncData(
  'ar-requirements',
  () => {
    return queryContent()
      .where({ _locale: locale.value, _extension: { $eq: 'yml' }, _path: { $contains: 'annual-report-requirements' } })
      .findOne()
  }
)

function signIn () {
  error.value = null
  signInWithPopup(auth, bcscAuthProvider).catch((reason) => {
    error.value = reason
  })
}

// can use to direct user after login but will always redirect if navigating home
// auth.onAuthStateChanged((user) => {
//   if (user) {
//     return navigateTo(localePath('/choose-existing-account'))
//   }
// })

// dev helpers
watchEffect(() => console.log('error: ', error.value))
watchEffect(() => console.log('user: ', user.value))
</script>
<template>
  <div class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.home.h1') }}
    </h1>
    <UCard class="w-full">
      <div class="flex flex-col text-left text-xl font-semibold text-bcGovColor-darkGray dark:text-white">
        <span>{{ $t('labels.busName') }}: SOME BUSINESS INC.</span>
        <span>{{ $t('labels.corpNum') }}: BC123456789</span>
        <span>{{ $t('labels.busNum') }}: 245678623456</span>
      </div>
    </UCard>
    <UCard class="w-full">
      <div class="flex flex-col text-left text-bcGovColor-midGray dark:text-white">
        <h2 class="mb-6">
          {{ arRequirements?.intro || '' }}
        </h2>
        <template v-if="arRequirements">
          <ul v-for="req in arRequirements!.requirements" :key="req" class="ml-4 list-disc">
            <li>{{ req }}</li>
          </ul>
        </template>
      </div>
    </UCard>
    <UButton
      :label="$t('btn.loginBCSC')"
      icon="i-mdi-card-account-details-outline"
      @click="signIn"
    />
  </div>
</template>
