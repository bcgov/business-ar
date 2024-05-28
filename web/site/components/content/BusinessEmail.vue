<script setup lang="ts">
const busStore = useBusinessStore()
const accountStore = useAccountStore()

const displayEmail = computed(() => {
  const mailingAddress = accountStore.currentAccount?.mailingAddress
  if (mailingAddress && mailingAddress.length > 0 && 'email' in mailingAddress[0]) {
    return mailingAddress[0].email
  } else {
    return busStore.currentBusiness?.email ?? 'No email found'
  }
})
</script>
<template>
  <span class="not-prose font-semibold">{{ displayEmail }}</span>
</template>
