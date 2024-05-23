<script setup lang="ts">
import { SbcHeaderMain, SbcFooter } from '#components'
const loadStore = useLoadingStore()

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
</script>
<template>
  <div
    class="relative flex min-h-screen flex-col bg-bcGovColor-gray1 dark:bg-bcGovGray-900"
  >
    <!-- <NuxtLoadingIndicator /> -->
    <SbcLoadingSpinner v-if="loadStore.pageLoading" overlay />
    <SbcHeaderMain />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SbcFooter />
  </div>
</template>
