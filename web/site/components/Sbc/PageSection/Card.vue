<script setup lang="ts">
const props = defineProps<{
  heading: string
  headingIcon?: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  isMobile?: boolean
  showContent?: boolean
}>()

defineEmits(['toggleContent'])

</script>
<template>
  <UCard
    class="w-full"
    :ui="{
      header: {
        base: 'rounded-t-lg',
        background: 'bg-bcGovColor-gray2',
        padding: 'px-4 py-5 sm:px-6',
      }
    }"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <component
          :is="headingLevel || 'h2'"
          :class="[
            'flex items-center gap-2 text-bcGovColor-darkGray dark:text-white',
            { 'text-2xl font-bold': isMobile, 'text-lg font-semibold': !isMobile }
          ]"
        >
          <UIcon
            v-if="headingIcon"
            :name="headingIcon"
            class="size-6 shrink-0 text-bcGovColor-activeBlue"
          />
          <span>{{ heading }}</span>
        </component>
        <!-- Dropdown button for mobile screens -->
        <button v-if="isMobile && showContent !== undefined" @click="$emit('toggleContent')">
          <UIcon
            :name="props.showContent ? 'i-mdi-chevron-up' : 'i-mdi-chevron-down'"
            class="size-6 shrink-0 text-bcGovColor-activeBlue"
          />
        </button>
      </div>
    </template>
    <slot />
  </UCard>
</template>
