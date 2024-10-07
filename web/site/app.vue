<script setup lang="ts">
const pageLoading = useState('page-loading', () => true) // global loading state
const { locale } = useI18n()

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true
})

// set lang and dir attributes on head
useHead({
  htmlAttrs: {
    lang: () => i18nHead.value.htmlAttrs!.lang,
    dir: () => i18nHead.value.htmlAttrs!.dir
  }
})

const appVersion = await getAppMetaInfo() // load ui and api version on app mount

// Query help markdown and globally provide it for use in either pages/help.vue or <SbcHelpModal />
const { data: contentDocs } = await useAsyncData('content-docs-query', () => {
  return queryContent()
    .where({ _locale: locale.value })
    .find()
}, {
  watch: [locale]
})

const helpDocs = computed(() =>
  contentDocs.value?.find(doc => doc._path === '/help')
)
const index1 = computed(() =>
  contentDocs.value?.find(doc => doc._path === '/index/1')
)
const index2 = computed(() =>
  contentDocs.value?.find(doc => doc._path === '/index/2')
)
const submittedSuccessText = computed(() => {
  return contentDocs.value?.find(doc => doc._path === '/submitted/success-text')
})
const submittedPlatformInfo = computed(() => {
  return contentDocs.value?.find(doc => doc._path === '/submitted/platform-info')
})
provide('sbc-bar-help-docs', helpDocs)
provide('sbc-bar-index1', index1)
provide('sbc-bar-index2', index2)
provide('sbc-bar-success-text', submittedSuccessText)
provide('sbc-bar-platform-info', submittedPlatformInfo)
</script>

<template>
  <div
    class="relative flex min-h-screen flex-col bg-bcGovColor-gray1 dark:bg-bcGovGray-900"
  >
    <NuxtLoadingIndicator color="#1669bb" />
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
