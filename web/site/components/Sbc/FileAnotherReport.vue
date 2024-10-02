<script setup lang="ts">
interface Item {
  label: string
  value: string | null
}

const props = defineProps<{
  items: Item[]
  lastARCompletedYear: number
  nextARYear: number | null
  arDueDates: Date[]
}>()
const emit = defineEmits(['fileNextReport'])

const filteredItems = computed(() => {
  return props.items.filter(item => item.value !== null)
})

const isOverdue = (date: Date) => {
  const today = new Date()
  return date < today
}
</script>

<template>
  <div class="w-full text-left">
    <h1 class="mb-5 text-2xl font-bold">
      {{ $t('SbcHeader.fileAnotherReport') }}
    </h1>

    <!-- Business Info -->
    <table class="w-full table-auto md:w-4/5 xl:w-2/3">
      <tbody v-for="item in filteredItems" :key="item.label">
        <tr class="flex flex-col md:table-row">
          <td class="font-semibold text-bcGovColor-darkGray">
            {{ item.label }}
          </td>
          <td class="text-bcGovColor-midGray">
            {{ item.value }}
          </td>
        </tr>
      </tbody>
    </table>
    <hr class="my-4 border-t border-gray-300">
    <h1 class="text-xl font-bold text-bcGovColor-darkGray">
      {{ $t('page.home.annualReports') }}
    </h1>
    <p class="mb-5 mt-1 text-sm text-bcGovColor-midGray">
      {{ $t('labels.reportsSequential') }}
    </p>

    <!-- Display all report dates until up to date -->
    <template v-if="props.lastARCompletedYear && props.nextARYear">
      <div v-for="(date, index) in arDueDates" :key="index" class="mb-4">
        <div
          class="flex flex-col items-center rounded-sm border p-4 md:flex-row md:justify-between"
          :class="isOverdue(date)
            ? 'border-red-500 bg-red-100'
            : 'border-bcGovColor-midGray bg-gray-100'"
        >
          <!-- First column: Red Alert Icon and date of report -->
          <div class="mb-4 flex w-full items-center md:mb-0 md:w-auto">
            <UAlert
              v-if="isOverdue(date)"
              class="mr-2 size-7 shrink-0 !rounded-none !bg-transparent !p-0 !pt-1 text-red-500 !ring-0"
              icon="i-mdi-alert"
            />
            <div v-else class="mr-2 size-7 shrink-0 !p-0 !pt-1" />
            <div class="flex-1">
              <h2 class="font-bold text-bcGovColor-darkGray md:text-lg">
                {{ $t('labels.annualReportWithDate', { year: date.getFullYear() }) }}
              </h2>
              <p class="text-bcGovColor-midGray">
                {{ $t('labels.annualReportDueDate', {
                  date: `${$i18n.locale.toLowerCase().includes('fr')
                    ? `${date.getDate()} ${date.toLocaleString('fr', { month: 'long' })} ${date.getFullYear()}`
                    : `${date.toLocaleString('en', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`
                  }`
                }) }}
              </p>
            </div>
          </div>

          <!-- Second column: File another Button (centered and full-width on small screens) -->
          <div class="flex w-full items-center justify-center md:w-auto">
            <UButton
              :label="$t('btn.fileAnotherReport')"
              :disabled="index !== 0"
              class="flex w-full items-center justify-center text-center font-bold md:w-auto"
              @click="emit('fileNextReport')"
            />
          </div>
        </div>
      </div>
      <SbcHelpTrigger />
    </template>
  </div>
</template>
