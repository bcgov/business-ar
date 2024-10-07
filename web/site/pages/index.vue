<script setup lang="ts">
const index1 = inject('sbc-bar-index1')
const index2 = inject('sbc-bar-index2')
const { t } = useI18n()
const keycloak = useKeycloak()
const { $keycloak } = useNuxtApp()
const route = useRoute()
const localePath = useLocalePath()
const busStore = useBusinessStore()
const accountStore = useAccountStore()
const pageLoading = useState('page-loading')
const alertStore = useAlertStore()
const environment = useRuntimeConfig().public.environment
const nextARYearRef = ref<number | null>(null)

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
    // return if user redirected from tos page
    if (route.query.fromTos) {
      pageLoading.value = false // only set false if not navigating to new page
      return
    }
    pageLoading.value = true
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
        pageLoading.value = false // only set false if not navigating to new page
        return
      }

      if (task === 'filing') { // TODO: figure out why combining the if statements always returns false
        if (busStore.payStatus !== 'PAID') {
          return navigateTo(localePath('/annual-report'))
        } else if (busStore.payStatus === 'PAID') { // add alert if filing is in paid state but hasnt been fully completed yet
          alertStore.addAlert({
            severity: 'info',
            category: AlertCategory.FILING_IN_PROGRESS
          })
          pageLoading.value = false // only set false if not navigating to new page
        }
      } else { // user is authenticated but theres no existing filing, continue normal flow
        return navigateTo(localePath('/accounts/choose-existing'))
      }
    } else if (!$keycloak.authenticated && route.query.nanoid) {
      // load business details if valid nano id and no user logged in (fresh start of flow)
      await busStore.getBusinessByNanoId(route.query.nanoid as string)
      pageLoading.value = false // only set false if not navigating to new page
    } else if (busStore.nanoID) {
      // Business has already been loaded
      pageLoading.value = false
    } else {
      alertStore.addAlert({
        severity: 'error',
        category: AlertCategory.MISSING_TOKEN
      })
      throw new Error('Missing token to fetch business details')
    }
  } catch (e) {
    console.error((e as Error).message)
    pageLoading.value = false
  }
}

// Compute page heading based on next AR year
const heading = computed(() => {
  return nextARYearRef.value
    ? t('page.home.h1Date', { date: nextARYearRef.value })
    : t('page.home.h1')
})

// Watch next AR year for header reactivity
watch(
  () => busStore.nextArYear,
  (newYear) => {
    if (newYear) {
      nextARYearRef.value = newYear
    }
  },
  { immediate: true }
)

const handleLogin = () => {
  keycloak.login()
}

// init page in setup lifecycle
if (import.meta.client) {
  initPage()
}
</script>
<template>
  <!-- TODO: find hydration error only when being redirected from tos page -->
  <!-- must use v-show for nuxt content to prerender correctly -->
  <div v-show="!pageLoading" class="mx-auto flex w-full flex-col items-center justify-center gap-4 text-center md:mt-3 md:w-4/5 lg:w-3/5">
    <ClientOnly>
      <SbcPageSectionH1 :heading="heading" />

      <SbcAlert
        :show-on-category="[
          AlertCategory.FUTURE_FILING,
          AlertCategory.INVALID_NEXT_AR_YEAR,
          AlertCategory.MISSING_TOKEN,
          AlertCategory.INTERNAL_SERVER_ERROR,
          AlertCategory.INVALID_TOKEN,
          AlertCategory.BUSINESS_DETAILS,
          AlertCategory.ACCOUNT_ACCESS,
          AlertCategory.FILING_IN_PROGRESS,
          AlertCategory.FUTURE_EFFECTIVE_FILINGS,
          AlertCategory.INACTIVE_CORP_STATE
        ]"
      />

      <!-- show business details -->
      <UCard v-show="!deepEqual(busStore.businessNano, {})" class="w-full" data-testid="bus-details-card">
        <SbcBusinessInfo
          break-value="sm"
          :items="[
            { label: $t('labels.busName'), value: busStore.businessNano.legalName },
            { label: $t('labels.corpNum'), value: `${busStore.businessNano.legalType}${busStore.businessNano.identifier.replace(/\D/g, '')}`},
            { label: $t('labels.busNum'), value: busStore.businessNano.taxId ? `${busStore.businessNano.taxId.slice(0, 9)} ${busStore.businessNano.taxId.slice(9)}` : null },
          ]"
          :is-selecting-filing="true"
          :ar-due-dates="busStore.getArDueDates()"
          :is-authenticated="keycloak.isAuthenticated()"
          @login="handleLogin"
        />
      </UCard>
    </ClientOnly>
    <!-- show data from nuxt content -->
    <!-- must use v-show, v-if will not prerender content because the queryContent method wont be called -->
    <SbcNuxtContentCard v-show="!keycloak.isAuthenticated()" id="initial" route-suffix="1" :content="index1" />
    <SbcNuxtContentCard
      v-show="keycloak.isAuthenticated() && alertStore.hasAlerts && alertStore.alerts[0].severity === 'error'"
      id="error"
      route-suffix="2"
      :content="index2"
    />

    <!-- Only displays in Dev and Test -->
    <ClientOnly>
      <div
        v-if="environment.includes('Development') || environment.includes('Test')"
        class="flex gap-2"
        @keydown.enter.prevent="useNanoId"
      >
        <UInput v-model="nanoid" placeholder="Enter a nano id" variant="bcGov" />
        <UButton label="Go" @click="useNanoId" />
      </div>
    </ClientOnly>
  </div>
</template>
