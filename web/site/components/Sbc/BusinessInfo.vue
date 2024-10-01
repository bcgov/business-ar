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
</script>
<template class="w-full">
  <div class="text-left">
    <!-- Desktop/Tablet View -->
    <h1 v-if="props.isSelectingFiling" class="mb-5 text-2xl font-bold">
      {{ $t('SbcHeader.loginBCReg') }}
    </h1>

    <table class="w-full table-auto">
      <tbody v-for="item in filteredItems" :key="item.label">
        <tr class="flex flex-col md:table-row md:flex-row">
          <td class="whitespace-nowrap align-top font-semibold text-bcGovColor-darkGray md:w-auto">
            {{ item.label }}
          </td>
          <td class="text-wrap break-words align-top text-bcGovColor-midGray md:w-auto md:pl-4">
            {{ item.value }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Login Screen when a valid Nano ID has been entered -->
    <div v-if="props.isSelectingFiling">
      <hr class="my-4 border-t border-gray-300">
      <h1 class="text-xl font-bold text-bcGovColor-darkGray">
        {{ $t('page.home.annualReports') }}
      </h1>
      <p class="mb-5 text-sm text-bcGovColor-midGray">
        {{ $t('labels.reportsSequential') }}
      </p>

      <!-- Iterate over the getDueReportDates -->
      <div v-for="(date, index) in arDueDates" :key="index" class="mb-4">
        <div class="flex flex-col items-center rounded-sm border border-red-500 bg-red-100 p-4 md:flex-row md:justify-between">
          <!-- First column: Red Alert Icon and Text (remains in a row on small screens) -->
          <div class="mb-4 flex w-full items-center md:mb-0 md:w-auto">
            <UAlert
              class="mr-2 size-7 shrink-0 !rounded-none !bg-transparent !p-0 !pt-1 text-red-500 !ring-0"
              icon="i-mdi-alert"
            />
            <div class="flex-1">
              <h2 class="font-bold text-bcGovColor-darkGray md:text-lg">
                {{ $t('labels.annualReportWithDate', { year: date.getFullYear() }) }}
              </h2>
              <p class="text-bcGovColor-midGray">
                {{ $t('labels.annualReportDueDate', {
                  date: `${date.toLocaleString($i18n.locale.toLowerCase().includes('fr') ? 'fr' : 'en', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
                }) }}
              </p>
            </div>
          </div>

          <!-- Second column: Button (centered and full-width on small screens) -->
          <div class="flex w-full items-center justify-center md:w-auto">
            <UButton
              v-if="!isAuthenticated"
              :label="$t('btn.loginBCSC')"
              :disabled="index !== 0"
              class="flex w-full items-center justify-center text-center md:w-auto"
              @click="emit('login')"
            />
          </div>
        </div>
      </div>
      <SbcHelpTrigger />
    </div>
  </div>
</template>
