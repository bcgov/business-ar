<script setup lang="ts">
const pageLoading = useState('page-loading', () => false)
const { locale } = useI18n()

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true
})

useHead({
  htmlAttrs: {
    lang: () => i18nHead.value.htmlAttrs!.lang,
    dir: () => i18nHead.value.htmlAttrs!.dir
  }
})

const appVersion = await getAppMetaInfo()

const { data: helpDocs } = await useAsyncData('help-docs-fetch', () => {
  return queryContent()
    .where({ _locale: locale.value, _path: { $eq: '/help' } })
    .findOne()
})
provide('sbc-bar-help-docs', helpDocs)
</script>
<template>
  <div
    class="relative flex min-h-screen flex-col bg-bcGovColor-gray1 dark:bg-bcGovGray-900"
  >
    <ClientOnly>
      <SbcLoadingSpinner v-if="pageLoading" overlay />
    </ClientOnly>
    <SbcHeaderMain :app-version="appVersion" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SbcFooter :app-version="appVersion" />
    <SbcHelpModal />
  </div>
</template>
