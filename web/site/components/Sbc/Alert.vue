<script setup lang="ts">
const alertStore = useAlertStore()
const props = defineProps<{
    showOnCategory: string | string[]
  }>()

const showAlert = computed(() => {
  const categories = Array.isArray(props.showOnCategory) ? props.showOnCategory : [props.showOnCategory]
  return alertStore.alerts.filter(alert => categories.includes(alert.category))
})
</script>
<template>
  <UAlert
    v-if="showAlert.length > 0"
    :title="showAlert[0].title"
    :description="showAlert[0].description"
    class="text-left"
    icon="i-mdi-alert"
    color="red"
    variant="subtle"
    :ui="{
      title: 'text-base text-bcGovColor-midGray font-semibold',
      description: 'mt-1 text-base leading-4 text-bcGovColor-midGray'
    }"
  />
</template>
