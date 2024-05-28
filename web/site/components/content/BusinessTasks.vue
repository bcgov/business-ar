<script setup lang="ts">
const busStore = useBusinessStore()
</script>
<template>
  <div v-show="busStore.businessTask === 'initial'">
    <slot name="initial" />
  </div>
  <div v-show="busStore.businessTask === 'none'">
    <slot name="none" />
  </div>
</template>
