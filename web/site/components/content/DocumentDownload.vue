<script setup lang="ts">
// handle document download buttons for final page, this will only work for the 2 current file from the backend
// any updates to the backend this will need to be reworked
const arStore = useAnnualReportStore()
const { t } = useI18n()
</script>
<template>
  <ClientOnly>
    <div
      v-if="arStore.arFiling.filing?.documents && arStore.arFiling.filing.documents.length > 0"
      class="flex w-full"
    >
      <UTooltip
        v-for="doc in arStore.arFiling.filing.documents"
        :key="doc.name"
        :text="doc.name === 'Receipt' ? t('page.submitted.receiptEmailNotice') : t('page.submitted.docEmailNotice')"
      >
        <UButton
          size="lg"
          color="blue"
          variant="outline"
          icon="i-mdi-tray-arrow-down"
          :loading="arStore.loading"
          :label="doc.name === 'Receipt' ? $t('btn.downloadReceipt') : $t('btn.downloadReport')"
          @click="arStore.handleDocumentDownload(doc)"
        />
      </UTooltip>
    </div>
  </ClientOnly>
</template>
