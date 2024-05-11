<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const routeWithoutLocale = useRouteWithoutLocale()
const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
const taskStore = useTaskStore()
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
    if ($keycloak.authenticated) {
      const { task, taskValue } = await taskStore.getTask()
      if (task === 'filing') {
        arStore.arFiling = { filing: { header: taskValue.filing.header, annualReport: taskValue.filing.annualReport } }
        await accountStore.getUserAccounts()
        accountStore.selectUserAccount(parseInt(taskValue.filing.header.paymentAccount))
        await navigateTo(localePath('/annual-report'))
      } else {
        await navigateTo(localePath('/accounts/choose-existing'))
      }
    } else if (!$keycloak.authenticated && route.query.nanoid) {
      await busStore.getBusinessByNanoId(route.query.nanoid as string)
    } else {
      throw new Error('Missing id to fetch business details')
    }
  } catch (e) {
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
