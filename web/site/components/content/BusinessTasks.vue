<script setup lang="ts">
const busStore = useBusinessStore()
</script>
<template>
  <div v-show="busStore.businessTask === 'initial'" class="-my-5">
    <slot name="initial" />
  </div>
  <div v-show="busStore.businessTask === 'none'" class="-my-5">
    <slot name="none" />
  </div>
</template>
