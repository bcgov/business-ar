<script setup lang="ts">
const helpModal = useHelpModal()
const localePath = useLocalePath()
</script>
<template>
  <!-- Open modal on touch screen, open new tab on desktop -->
  <!-- Hide modal trigger on desktop -->
  <a
    class="inline-flex items-center text-blue-600 underline [@media(pointer:fine)]:hidden"
    href="#"
    @click.prevent="helpModal.open()"
  >
    {{ $t('btn.openHelpDocs') }}
    <i icon="i-mdi-open-in-new ml-1" />
  </a>

  <!-- Hide link on touch screen -->
  <a
    class="inline-flex items-center text-blue-600 underline [@media(pointer:coarse)]:hidden"
    :href="localePath('/help')"
    target="_blank"
  >
    {{ $t('btn.openHelpDocs') }}
    <i icon="i-mdi-open-in-new ml-1" />
  </a>
</template>
