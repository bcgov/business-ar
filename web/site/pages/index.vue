<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const routeWithoutLocale = useRouteWithoutLocale()

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})
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
