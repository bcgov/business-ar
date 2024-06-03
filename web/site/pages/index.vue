<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const { $keycloak } = useNuxtApp()
const route = useRoute()
const localePath = useLocalePath()
const busStore = useBusinessStore()
const accountStore = useAccountStore()
const loadStore = useLoadingStore()
loadStore.pageLoading = true
const alertStore = useAlertStore()

const nanoid = ref(route.query.nanoid || '')
async function useNanoId () {
  await navigateTo(localePath(`/?nanoid=${nanoid.value}`))
  await initPage()
}

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

// init page function to be able to return navigateTo instead of await, smoother UX
async function initPage () {
  try {
    loadStore.pageLoading = true
    alertStore.$reset()
    // get business task is user is logged in (user was redirected after keycloak login)
    if ($keycloak.authenticated) {
      await accountStore.updateUserProfile()
      if (route.query.nanoid) { // load new business details if user already logged in and provides a new nano id
        resetPiniaStores() // reset state when loading a new business
        await busStore.getBusinessByNanoId(route.query.nanoid as string)
      }

      // fetch next business task
      const { task } = await busStore.getBusinessTask()

      // handle case where there are no tasks available (filings up to date)
      if (task === null) {
        loadStore.pageLoading = false // only set false if not navigating to new page
        return
      }

      if (task === 'filing') { // TODO: figure out why combining the if statements always returns false
        if (busStore.payStatus !== 'PAID') {
          return navigateTo(localePath('/annual-report'))
        }
      } else { // user is authenticated but theres no existing filing, continue normal flow
        return navigateTo(localePath('/accounts/choose-existing'))
      }
      // loadStore.pageLoading = false // only set false if not navigating to new page
    } else if (!$keycloak.authenticated && route.query.nanoid) {
      // load business details if valid nano id and no user logged in (fresh start of flow)
      await busStore.getBusinessByNanoId(route.query.nanoid as string)
      loadStore.pageLoading = false // only set false if not navigating to new page
    } else { // throw error if no valid nano id
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.MISSING_TOKEN
      })
      console.error('Missing token to fetch business details')
      throw new Error('Missing token to fetch business details')
    }
  } catch (e) { // log error and redirect if no nano id or any of the previous calls fail
    console.error((e as Error).message)
  } finally {
    loadStore.pageLoading = false
  }
}

// init page in setup lifecycle
if (import.meta.client) {
  initPage()
}
</script>
<template>
  <!-- must use v-show for nuxt content to prerender correctly -->
  <div v-show="!loadStore.pageLoading" class="mx-auto flex max-w-[95vw] flex-col items-center justify-center gap-4 text-center">
    <ClientOnly>
      <SbcPageSectionH1 :heading="$t('page.home.h1')" />

      <SbcAlert
        :show-on-category="[
          AlertCategory.FUTURE_FILING,
          AlertCategory.INVALID_NEXT_AR_YEAR,
          AlertCategory.MISSING_TOKEN,
          AlertCategory.INTERNAL_SERVER_ERROR,
          AlertCategory.INVALID_TOKEN,
          AlertCategory.BUSINESS_DETAILS
        ]"
      />

      <!-- show business details -->
      <UCard v-show="!deepEqual(busStore.businessNano, {})" class="w-full" data-testid="bus-details-card">
        <SbcBusinessInfo
          break-value="sm"
          :items="[
            { label: $t('labels.busName'), value: busStore.businessNano.legalName },
            { label: $t('labels.corpNum'), value: busStore.businessNano.identifier },
            { label: $t('labels.busNum'), value: busStore.businessNano.taxId },
          ]"
        />
      </UCard>
    </ClientOnly>
    <!-- show data from nuxt content -->
    <!-- must use v-show, v-if will not prerender content because the queryContent method wont be called -->
    <SbcNuxtContentCard v-show="!keycloak.isAuthenticated()" id="initial" route-suffix="1" />
    <SbcNuxtContentCard v-show="keycloak.isAuthenticated() && alertStore.hasAlerts" id="error" route-suffix="2" />
    <ClientOnly>
      <UButton
        v-if="!keycloak.isAuthenticated() && !alertStore.hasAlerts"
        :label="$t('btn.loginBCSC')"
        icon="i-mdi-card-account-details-outline"
        @click="keycloak.login"
      />
      <div
        v-if="useRuntimeConfig().public.environment !== undefined"
        class="flex gap-2"
        @keydown.enter.prevent="useNanoId"
      >
        <UInput v-model="nanoid" placeholder="Enter a nano id" variant="bcGov" />
        <UButton label="Go" @click="useNanoId" />
      </div>
    </ClientOnly>
  </div>
</template>
