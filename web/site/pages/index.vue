<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const routeWithoutLocale = useRouteWithoutLocale()
const busStore = useBusinessStore()
const route = useRoute()
const localePath = useLocalePath()

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
</script>
<template>
  <SbcLoadingSpinner v-if="busStore.loading" />
  <div v-else class="mx-auto flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.home.h1') }}
    </h1>
    <UCard class="w-full">
      <div class="flex flex-col text-left text-xl font-semibold text-bcGovColor-darkGray dark:text-white">
        <span>{{ $t('labels.busName') }}: {{ busStore.currentBusiness.legalName }}</span>
        <span>{{ $t('labels.corpNum') }}: {{ busStore.currentBusiness.jurisdiction + busStore.currentBusiness.identifier }}</span>
        <span>{{ $t('labels.busNum') }}: {{ busStore.currentBusiness.businessNumber }}</span>
      </div>
    </UCard>
    <UCard class="w-full">
      <ContentDoc
        :query="{
          path: routeWithoutLocale,
          where: { _locale: $i18n.locale }
        }"
        class="prose prose-bcGov text-left"
      />
    </UCard>
    <UButton
      :label="$t('btn.loginBCSC')"
      icon="i-mdi-card-account-details-outline"
      @click="keycloak.login"
    />
  </div>
</template>
