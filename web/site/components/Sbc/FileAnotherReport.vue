<script setup lang="ts">
const props = defineProps<{
  lastARCompletedYear: number
  nextARYear: number | null
  arDueDates: Date[]
}>()
const emit = defineEmits(['fileNextReport'])
</script>

<template>
  <div class="w-full text-left">
    <!-- Iterate over the getDueReportDates if there is another report to do -->
    <template v-if="props.lastARCompletedYear && props.nextARYear">
      <div v-for="(date, index) in arDueDates" :key="index" class="mb-4">
        <div class="flex items-center justify-between rounded-sm border border-red-500 bg-red-100 p-4">
          <!-- First column: Red Alert Icon -->
          <div class="flex items-center">
            <UAlert
              class="mr-2 size-7 shrink-0 !rounded-none !bg-transparent !p-0 !pt-1 text-red-500 !ring-0"
              icon="i-mdi-alert"
            />
          </div>
          <!-- Second column: Report Title and Date -->
          <div class="flex-1">
            <h2 class="text-lg font-bold text-bcGovColor-darkGray">
              {{ date.getFullYear() }} BC Annual Report
            </h2>
            <p class="text-bcGovColor-midGray">
              Due {{ date.toLocaleString('default', { month: 'long' }) }} {{ date.getDate() }}, {{ date.getFullYear() }}
            </p>
          </div>
          <!-- Third column: Button -->
          <div class="flex items-center">
            <UButton
              :label="$t('btn.loginBCSC')"
              :disabled="index !== 0"
              @click="emit('fileNextReport')"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
