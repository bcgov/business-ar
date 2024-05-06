<script setup lang="ts">
const busStore = useBusinessStore()
</script>
<template>
  <span class="not-prose font-semibold">{{ busStore.currentBusiness.email ?? 'No email found' }}</span>
</template>
