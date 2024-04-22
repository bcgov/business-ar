<script setup lang="ts">
import { SbcHeaderMain, SbcFooter } from '#components'
// const { locale } = useI18n()
// const localePath = useLocalePath()
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

// template ref for header component
const headerRef = ref<InstanceType<typeof SbcHeaderMain> | null>(null)
const footerRef = ref<InstanceType<typeof SbcFooter> | null>(null)
const { height: mainHeaderHeight } = useElementSize(headerRef)
const { height: footerHeight } = useElementSize(footerRef)

// provide element heights to offset headers/asides
provide('mainHeaderHeight', mainHeaderHeight)
provide('footerHeight', footerHeight)
</script>
<template>
  <div
    class="flex min-h-screen flex-col bg-bcGovColor-gray1 dark:bg-bcGovGray-900"
  >
    <SbcHeaderMain ref="headerRef" class="sticky inset-x-0 top-0 z-50" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SbcFooter ref="footerRef" class="z-50" />
  </div>
</template>
