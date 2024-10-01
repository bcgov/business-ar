<script setup lang="ts">
const helpModal = useHelpModal()
const localePath = useLocalePath()
</script>
<template>
  <!-- open modal on touch screen, open new tab on desktop -->
  <!-- hide modal trigger on desktop -->
  <UButton
    class="border-0 bg-transparent p-0 text-blue-600 underline [@media(pointer:fine)]:hidden"
    variant="link"
    :label="$t('btn.openHelpDocs')"
    icon="i-mdi-open-in-new"
    trailing
    size="sm"
    @click="helpModal.open()"
  />
  <!-- hide link on touch screen -->
  <UButton
    class="border-0 bg-transparent p-0 text-blue-600 underline [@media(pointer:coarse)]:hidden"
    variant="link"
    :label="$t('btn.openHelpDocs')"
    icon="i-mdi-open-in-new"
    trailing
    size="sm"
    target="_blank"
    :to="localePath('/help')"
  />
</template>
