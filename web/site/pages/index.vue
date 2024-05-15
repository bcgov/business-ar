<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const route = useRoute()
const localePath = useLocalePath()
const busStore = useBusinessStore()
const initPage = ref<boolean>(true)

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

// load business details using route query nano id or navigate to /missing-id
onBeforeMount(async () => {
  try {
    // get business task is user is logged in (user was redirected after keycloak login)
    if (keycloak.isAuthenticated()) {
      if (route.query.nanoid) { // load new business details if user already logged in and provides a new nano id
        resetPiniaStores() // reset state when loading a new business
        await busStore.getBusinessByNanoId(route.query.nanoid as string)
      }
      const { task } = await busStore.getBusinessTask()
      if (task === 'filing') { // TODO: figure out why combining the if statements always returns false
        if (busStore.payStatus !== 'PAID') {
          await navigateTo(localePath('/annual-report'))
        }
      } else { // user is authenticated but theres no existing filing, continue normal flow
        await navigateTo(localePath('/accounts/choose-existing'))
      }
    } else if (!keycloak.isAuthenticated() && route.query.nanoid) {
      // load business details if valid nano id and no user logged in (fresh start of flow)
      await busStore.getBusinessByNanoId(route.query.nanoid as string)
    } else { // throw error if no valid nano id
      throw new Error('Missing id to fetch business details')
    }
  } catch (e) { // log error and redirect if no nano id or any of the previous calls fail
    console.error((e as Error).message)
    await navigateTo(localePath('/missing-id'))
  } finally {
    initPage.value = false
  }
})
</script>
<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <SbcLoadingSpinner v-if="initPage" overlay />
  <!-- must use v-show for nuxt content to prerender correctly -->
  <div v-show="!initPage" class="mx-auto flex flex-col items-center justify-center gap-4 text-center">
    <!-- show different h1 depending on pay status -->
    <h1 v-if="busStore.payStatus === 'PAID'" class="flex items-center gap-2 text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      <span>{{ $t('page.submitted.h1') }}</span>
      <UIcon
        name="i-mdi-check-circle-outline"
        class="size-10 shrink-0 text-outcomes-approved"
      />
    </h1>
    <h1 v-else class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.home.h1') }}
    </h1>
    <!-- show business details -->
    <UCard class="w-full" data-testid="bus-details-card">
      <div class="flex grid-cols-6 flex-col text-left sm:grid">
        <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray">{{ $t('labels.busName') }}</span>
        <span class="col-span-full col-start-3 whitespace-nowrap text-bcGovColor-midGray">{{ busStore.businessNano.legalName }}</span>
        <span class="col-span-2 col-start-1 mt-2 whitespace-nowrap font-semibold text-bcGovColor-darkGray sm:mt-0">{{ $t('labels.corpNum') }}</span>
        <span class="col-span-full col-start-3 mb-2 whitespace-nowrap text-bcGovColor-midGray sm:mb-0">{{ busStore.businessNano.identifier }}</span>
        <span v-if="busStore.businessNano.taxId" class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.busNum') }}</span>
        <span v-if="busStore.businessNano.taxId" class="col-span-full col-start-3 whitespace-nowrap text-bcGovColor-midGray">{{ busStore.businessNano.taxId }}</span>
      </div>
    </UCard>
    <!-- show data from nuxt content -->
    <!-- must use v-show, v-if will not prerender content because the queryContent method wont be called -->
    <SbcNuxtContentCard v-show="busStore.payStatus !== 'PAID'" id="initial" route-suffix="1" />
    <SbcNuxtContentCard v-show="busStore.payStatus === 'PAID'" id="report-completed" route-suffix="2" />
    <UButton
      v-if="busStore.payStatus !== 'PAID'"
      :label="$t('btn.loginBCSC')"
      icon="i-mdi-card-account-details-outline"
      @click="keycloak.login"
    />
  </div>
</template>
