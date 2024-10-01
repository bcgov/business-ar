<script setup lang="ts">
interface Item {
  label: string
  value: string | null
}

const props = defineProps<{
  items: Item[]
  breakValue: 'sm' | 'md' | 'lg'
  isSelectingFiling: boolean
  arDueDates?: Date[]
  isAuthenticated: boolean | undefined
}>()

const emit = defineEmits(['login'])

const filteredItems = computed(() => {
  return props.items.filter(item => item.value !== null)
})

const breakpoint: Record<string, { [key: string]: string }> = {
  table: {
    sm: 'sm:block',
    md: 'md:block',
    lg: 'lg:block'
  },
  flex: {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden'
  }
}
</script>
<template class="w-full">
  <div class="text-left">
    <!-- Desktop/Tablet View -->
    <h1 v-if="props.isSelectingFiling" class="mb-5 text-2xl font-bold">
      Log in to BC Registries
    </h1>

    <table
      class="hidden w-fit table-auto"
      :class="breakpoint.table[breakValue]"
    >
      <tbody v-for="item in filteredItems" :key="item.label">
        <tr>
          <td class="whitespace-nowrap align-top font-semibold text-bcGovColor-darkGray">
            {{ item.label }}
          </td>
          <td class="text-wrap break-words pl-4 align-top text-bcGovColor-midGray">
            {{ item.value }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Login Screen when a valid Nano ID has been entered -->
    <div v-if="props.isSelectingFiling">
      <hr class="my-4 border-t border-gray-300">
      <h1 class="text-xl font-bold text-bcGovColor-darkGray">
        Annual Reports
      </h1>
      <p class="mb-5 text-sm text-bcGovColor-midGray">
        Reports must be filed from oldest to newest.
      </p>

      <!-- Iterate over the getDueReportDates -->
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
              v-if="!isAuthenticated"
              :label="$t('btn.loginBCSC')"
              :disabled="index !== 0"
              @click="emit('login')"
            />
          </div>
        </div>
      </div>
      <SbcHelpTrigger />
    </div>

    <!-- Mobile View -->
    <div
      v-for="item in filteredItems"
      :key="item.label"
      class="flex flex-col"
      :class="breakpoint.flex[breakValue]"
    >
      <span class="font-semibold text-bcGovColor-darkGray">
        {{ item.label }}
      </span>
      <span class="mb-4 text-bcGovColor-midGray last:mb-0">
        {{ item.value }}
      </span>
    </div>
  </div>
</template>
