<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const routeWithoutLocale = useRouteWithoutLocale()
const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
const busStore = useBusinessStore()
const arStore = useAnnualReportStore()
const accountStore = useAccountStore()
const initPage = ref<boolean>(true)

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

// explicitly calling this instead of using <ContentDoc /> as its unreliable for pnpm generate
const { data } = await useAsyncData('content-data', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
})

// load business details using route query nano id or navigate to /missing-id
onBeforeMount(async () => {
  const { $keycloak } = useNuxtApp()
  try {
    // get business task is user is logged in (user was redirected after keycloak login)
    if ($keycloak.authenticated) {
      const { task, taskValue } = await busStore.getBusinessTask()
      // if task === 'filing', set store arFiling value
      if (task === 'filing' && 'filing' in taskValue) { // this means user has tried to file an ar previously
        arStore.arFiling = { filing: { header: taskValue.filing.header, annualReport: taskValue.filing.annualReport } }
        // get users accounts
        await accountStore.getUserAccounts()
        // set the account to the existing filings paymentAccount
        accountStore.selectUserAccount(parseInt(taskValue.filing.header.paymentAccount))
        // redirect to final page if already paid
        if (taskValue.filing.header.status === 'PAID') {
          await navigateTo(localePath('/submitted'))
        } else { // else redirect to annual-report page if filing wasnt paid
          await navigateTo(localePath('/annual-report'))
        }
      } else { // user is authenticated but theres no existing filing, continue normal flow
        await navigateTo(localePath('/accounts/choose-existing'))
      }
    } else if (!$keycloak.authenticated && route.query.nanoid) {
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
  <SbcLoadingSpinner v-if="initPage" overlay />
  <div v-else class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.home.h1') }}
    </h1>
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
    <UCard class="w-full" data-testid="content-data">
      <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
    </UCard>
    <UButton
      :label="$t('btn.loginBCSC')"
      icon="i-mdi-card-account-details-outline"
      @click="keycloak.login"
    />
  </div>
</template>
