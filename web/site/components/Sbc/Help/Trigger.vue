<script setup lang="ts">
const helpModal = useHelpModal()
const localePath = useLocalePath()
</script>
<template>
  <!-- open modal on touch screen, open new tab on desktop -->
  <!-- hide modal trigger on desktop -->
  <UButton
    class="[@media(pointer:fine)]:hidden text-blue-600 underline bg-transparent border-0 p-0"
    variant="link"
    :label="$t('btn.openHelpDocs')"
    icon="i-mdi-open-in-new"
    trailing
    size="sm"
    @click="helpModal.open()"
  />
  <!-- hide link on touch screen -->
  <UButton
    class="[@media(pointer:coarse)]:hidden text-blue-600 underline bg-transparent border-0 p-0"
    variant="link"
    :label="$t('btn.openHelpDocs')"
    icon="i-mdi-open-in-new"
    trailing
    size="sm"
    target="_blank"
    :to="localePath('/help')"
  />
</template>
