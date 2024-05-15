<script setup lang="ts">
interface Item {
  label: string
  value: string | null
}

const props = defineProps<{
  items: Item[]
}>()

const filteredItems = computed(() => {
  return props.items.filter(item => item.value !== null)
})
</script>
<template>
  <div class="text-left">
    <!-- Desktop/Tablet View -->
    <table class="-mx-4 hidden w-max table-fixed border-separate border-spacing-x-4 sm:block">
      <tbody v-for="item in filteredItems" :key="item.label">
        <tr>
          <td class="whitespace-nowrap font-semibold text-bcGovColor-darkGray">
            {{ item.label }}
          </td>
          <td class="text-wrap text-bcGovColor-midGray">
            {{ item.value }}
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Mobile View -->
    <div
      v-for="item in filteredItems"
      :key="item.label"
      class="flex flex-col sm:hidden"
    >
      <span class="whitespace-nowrap font-semibold text-bcGovColor-darkGray">
        {{ item.label }}
      </span>
      <span class="mb-4 text-bcGovColor-midGray last:mb-0">
        {{ item.value }}
      </span>
    </div>
  </div>
</template>
