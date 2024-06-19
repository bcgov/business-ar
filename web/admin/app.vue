<script setup lang="ts">
const pageLoading = useState('page-loading', () => false)

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
  </div>
</template>
