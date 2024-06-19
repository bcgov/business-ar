<script setup lang="ts">
const { t } = useI18n()
const pageLoading = useState('page-loading')
const searchText = ref<string>('')

useHead({
  title: t('page.admin.title')
})

onMounted(() => {
  pageLoading.value = false
})
</script>
<template>
  <ClientOnly>
    <div v-show="!pageLoading" class="relative mx-auto flex w-full max-w-[1360px] flex-col gap-4 text-left">
      <SbcPageSectionH1 :heading="$t('page.admin.h1')" />
      <UCard :ui="{ body: { base: 'space-y-4' }}">
        <UFormGroup
          class="-mt-4"
          :label="$t('page.admin.table.invite.searchInput.label')"
          :help="$t('page.admin.table.invite.searchInput.help')"
        >
          <UInput
            v-model="searchText"
            variant="bcGov"
            :placeholder="$t('page.admin.table.invite.searchInput.placeholder')"
            trailing
            icon="i-mdi-search"
          />
        </UFormGroup>

        <SbcTableInvitations :search-text />
      </UCard>
    </div>
  </ClientOnly>
</template>
