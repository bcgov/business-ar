<script setup lang="ts">
defineProps<{
  title: string
  items?: string[]
}>()
</script>
<template>
  <section>
    <h4 class="font-semibold">
      {{ title }}
    </h4>
    <slot>
      <ul class="ml-2 flex flex-col text-sm">
        <li v-for="item in items" :key="item">
          {{ item }}
        </li>
      </ul>
    </slot>
  </section>
</template>
