<script setup lang="ts">
const { t } = useI18n()
const keycloak = useKeycloak()
const route = useRoute()
const localePath = useLocalePath()
const busStore = useBusinessStore()
const accountStore = useAccountStore()
const loadStore = useLoadingStore()
loadStore.pageLoading = true

useHead({
  title: t('page.home.title')
})

definePageMeta({
  order: 0
})

// init page function to be able to return navigateTo instead of await, smoother UX
async function initPage () {
  try {
    // get business task is user is logged in (user was redirected after keycloak login)
    if (keycloak.isAuthenticated()) {
      await accountStore.updateUserProfile()
      if (route.query.nanoid) { // load new business details if user already logged in and provides a new nano id
        resetPiniaStores() // reset state when loading a new business
        await busStore.getBusinessByNanoId(route.query.nanoid as string)
      }
      const { task } = await busStore.getBusinessTask()
      if (task === 'filing') { // TODO: figure out why combining the if statements always returns false
        if (busStore.payStatus !== 'PAID') {
          return navigateTo(localePath('/annual-report'))
        }
      } else { // user is authenticated but theres no existing filing, continue normal flow
        return navigateTo(localePath('/accounts/choose-existing'))
      }
      loadStore.pageLoading = false // only set false if not navigating to new page
    } else if (!keycloak.isAuthenticated() && route.query.nanoid) {
      // load business details if valid nano id and no user logged in (fresh start of flow)
      await busStore.getBusinessByNanoId(route.query.nanoid as string)
      loadStore.pageLoading = false // only set false if not navigating to new page
    } else { // throw error if no valid nano id
      throw new Error('Missing token to fetch business details')
    }
  } catch (e) { // log error and redirect if no nano id or any of the previous calls fail
    console.error((e as Error).message)
    return navigateTo(localePath('/missing-id'))
  }
}

// init page in setup lifecycle
if (import.meta.client) {
  initPage()
}
</script>
<template>
  <!-- must use v-show for nuxt content to prerender correctly -->
  <div v-show="!loadStore.pageLoading" class="mx-auto flex max-w-[95vw] flex-col items-center justify-center gap-4 text-center">
    <ClientOnly>
      <!-- show different h1 depending on pay status -->
      <SbcPageSectionH1
        v-if="busStore.payStatus === 'PAID'"
        class="flex w-fit items-center justify-center gap-2"
      >
        <span>{{ $t('page.submitted.h1') }}</span>
        <span class="flex items-center justify-center">
          <UIcon
            name="i-mdi-check-circle-outline"
            class="size-10 text-outcomes-approved"
          />
        </span>
      </SbcPageSectionH1>
      <SbcPageSectionH1
        v-else
        :heading="$t('page.home.h1')"
      />

      <!-- show business details -->
      <UCard class="w-full overflow-x-auto" data-testid="bus-details-card">
        <SbcBusinessInfo
          break-value="sm"
          :items="[
            { label: $t('labels.busName'), value: busStore.businessNano.legalName },
            { label: $t('labels.corpNum'), value: busStore.businessNano.identifier },
            { label: $t('labels.busNum'), value: busStore.businessNano.taxId },
          ]"
        />
      </UCard>
    </ClientOnly>
    <!-- show data from nuxt content -->
    <!-- must use v-show, v-if will not prerender content because the queryContent method wont be called -->
    <SbcNuxtContentCard v-show="busStore.payStatus !== 'PAID'" id="initial" route-suffix="1" />
    <SbcNuxtContentCard v-show="busStore.payStatus === 'PAID'" id="report-completed" route-suffix="2" />
    <UButton
      v-if="busStore.payStatus !== 'PAID'"
      :label="$t('btn.loginBCSC')"
      icon="i-mdi-card-account-details-outline"
      @click="keycloak.login"
    />
  </div>
</template>
