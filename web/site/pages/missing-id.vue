<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const nanoid = ref('')

useHead({
  title: t('page.missingId.title')
})

definePageMeta({
  order: 0
})
</script>
<template>
  <div class="mx-auto flex flex-col items-center justify-center gap-4 text-center">
    <h1 class="text-3xl font-semibold text-bcGovColor-darkGray dark:text-white">
      {{ $t('page.missingId.h1') }}
    </h1>
    <SbcNuxtContentCard id="missing-id" />
    <!-- this is only for dev to enter nano ids -->
    <div class="flex gap-2">
      <UInput v-model="nanoid" placeholder="Enter a nano id" variant="bcGov" />
      <UButton label="Go" :to="localePath(`/?nanoid=${nanoid}`)" />
    </div>
  </div>
</template>
