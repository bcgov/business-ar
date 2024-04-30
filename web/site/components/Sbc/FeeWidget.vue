<script setup lang="ts" generic="T">
import { type PayFeesWidgetItem } from '~/interfaces/fees'

const props = defineProps({
  fees: { type: Array<PayFeesWidgetItem>, required: true }
})

defineEmits(['submit']) // fix typing ?

const hasEmptyFees = computed(() => !props.fees?.length)

const displayCanadianDollars = (amount: number) => {
  if (!amount) {
    return '$0.00'
  }

  return `$${(amount.toFixed(2))}`
}

const total = computed(() => {
  return props.fees.reduce((total, feeInfo) => total + feeInfo.total, 0)
})
</script>
<template>
  <div class="flex flex-col gap-4">
    <UCard
      data-cy="pay-fees-widget"
      :ui="{
        base: 'w-full md:w-[282px]',
        header:
          {
            base: 'rounded-t-lg',
            background: 'bg-bcGovColor-header',
            padding: 'p-4'
          }
      }"
    >
      <template #header>
        <span data-cy="pay-fees-widget-title" class="font-semibold text-white">{{ $t('widgets.feeSummary.title') }}</span>
      </template>

      <div
        v-for="fee in fees"
        :key="fee.uiUuid"
        class="flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <span class="mr-auto text-sm font-bold text-bcGovColor-darkGray">
            <!-- {{ $t(`widgets.feeSummary.itemLabels.${fee.filingTypeCode}`) }} -->
            BC Annual Report
          </span>
          <span class="whitespace-nowrap text-sm font-bold">
            {{ fee.total === 0 ? $t('widgets.feeSummary.noFee') : displayCanadianDollars(fee.total) }}
          </span>
        </div>
      <!-- <span v-if="fee.quantity > 1" class="float-right ml-2 text-sm font-normal text-gray-400">
        {{ `X${fee.quantity}` }}
      </span> -->
      </div>
      <!-- <div class="flex items-center justify-between">
        <span class="mr-auto text-sm font-bold text-bcGovColor-darkGray"> -->
      <!-- {{ $t(`widgets.feeSummary.itemLabels.${fee.filingTypeCode}`) }} -->
      <!-- Processing Fee
        </span>
        <span class="whitespace-nowrap text-sm font-bold">{{ displayCanadianDollars(1.80) }}</span>
      </div> -->

      <template #footer>
        <div class="flex items-center justify-between" data-cy="pay-fees-widget-total">
          <span class="mr-auto text-sm font-bold text-bcGovColor-darkGray">
            {{ $t('widgets.feeSummary.total') }}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-sm font-normal text-gray-700">
              {{ $t('currency.cad') }}
            </span>
            <span
              v-if="fees?.length > 0"
              class="overflow-hidden whitespace-nowrap text-2xl font-bold"
            >
              {{ displayCanadianDollars(total) }}
            </span>
            <span
              v-else
              class="overflow-hidden whitespace-nowrap text-2xl font-bold"
            >
              -
            </span>
          </div>
        </div>
      </template>
    </UCard>
    <UButton
      label="Submit & Pay"
      block
      @click="$emit('submit')"
    />
  </div>
</template>
