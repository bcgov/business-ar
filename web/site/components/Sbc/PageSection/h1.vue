<script setup lang="ts">
defineProps<{
  heading?: string
}>()
</script>
<template>
  <h1 class="text-3xl font-semibold dark:text-white">
    {{ heading || '' }}
    <slot />
  </h1>
</template>
