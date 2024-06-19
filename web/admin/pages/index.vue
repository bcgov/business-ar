<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const pageLoading = useState('page-loading')

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

onMounted(() => {
  pageLoading.value = false
})
</script>
<template>
  <ClientOnly>
    <!-- must use v-show for nuxt content to prerender correctly -->
    <div v-show="!pageLoading" class="mx-auto flex max-w-[95vw] flex-col items-center justify-center gap-4 text-center">
      <SbcPageSectionH1 :heading="$t('page.home.h1')" />
      <SbcAlert
        :show-on-category="[
          AlertCategory.INTERNAL_SERVER_ERROR,
          AlertCategory.REQUIRES_STAFF_USER
        ]"
      />
      <UCard class="max-w-md text-left">
        <h2 class="text-xl font-semibold text-bcGovColor-darkGray">
          {{ $t('labels.login') }}
        </h2>
        <p>{{ $t('page.home.loginHint') }}</p>
        <img src="/img/BCReg_Generic_Login_image.jpg" class="my-4" :alt="$t('page.home.loginImgAlt')">
        <div class="space-y-4">
          <UButton
            v-if="!keycloak.isAuthenticated()"
            :label="$t('btn.loginIDIR')"
            icon="i-mdi-account-group-outline"
            block
            @click="keycloak.loginIDIR"
          />
        </div>
      </UCard>
    </div>
  </ClientOnly>
</template>
