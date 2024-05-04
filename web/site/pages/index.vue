<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const routeWithoutLocale = useRouteWithoutLocale()
const busStore = useBusinessStore()
const route = useRoute()
const localePath = useLocalePath()
const { locale } = useI18n()
// console.log(routeWithoutLocale.value)
useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

// load business details using route query nano id or navigate to /missing-id
onMounted(async () => {
  if (!route.query.nanoid) {
    return navigateTo(localePath('/missing-id'))
  } else {
    try {
    // http://localhost:3000/en-CA?nanoid=TIG9kz_ykKVo0FMQAH76o
      await busStore.getBusinessByNanoId(route.query.nanoid as string)
    } catch {
      await navigateTo(localePath('/missing-id'))
    }
  }
})

const { data } = await useAsyncData('content-data', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: routeWithoutLocale.value } })
    .findOne()
})
</script>
<template>
  <SbcLoadingSpinner v-if="busStore.loading" />
  <div v-else class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.home.h1') }}
    </h1>
    <UCard class="w-full">
      <div class="flex grid-cols-6 flex-col text-left sm:grid">
        <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray">{{ $t('labels.busName') }}</span>
        <span class="col-span-full col-start-3 whitespace-nowrap text-bcGovColor-midGray">{{ busStore.currentBusiness.legalName }}</span>
        <span class="col-span-2 col-start-1 mt-2 whitespace-nowrap font-semibold text-bcGovColor-darkGray sm:mt-0">{{ $t('labels.corpNum') }}</span>
        <span class="col-span-full col-start-3 mb-2 whitespace-nowrap text-bcGovColor-midGray sm:mb-0">{{ busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier }}</span>
        <span class="col-span-2 col-start-1 whitespace-nowrap font-semibold text-bcGovColor-darkGray ">{{ $t('labels.busNum') }}</span>
        <span class="col-span-full col-start-3 whitespace-nowrap text-bcGovColor-midGray">{{ busStore.currentBusiness.businessNumber }}</span>
      </div>
    </UCard>
    <UCard class="w-full">
      <ContentRenderer :value="data" class="prose prose-bcGov text-left" />
      <!-- <ContentDoc
        :query="{
          path: routeWithoutLocale,
          where: { _locale: $i18n.locale }
        }"
        class="prose prose-bcGov text-left"
      /> -->
    </UCard>
    <UButton
      :label="$t('btn.loginBCSC')"
      icon="i-mdi-card-account-details-outline"
      @click="keycloak.login"
    />
  </div>
</template>
