<script setup lang="ts">
const { mainLinks, loggedInUserOptions } = useSbcNav()
const keycloak = useKeycloak()
const account = useAccountStore()
</script>
<template>
  <header
    id="sbc-main-header"
    data-testid="sbc-main-header"
    class="border-b-2 border-bcGovColor-navDivider bg-bcGovColor-header p-2 sm:px-4 dark:border-b dark:bg-bcGovColor-darkGray"
  >
    <nav
      class="m-auto flex w-full max-w-[1360px] items-center justify-between"
      :aria-label="$t('SbcHeader.navLabel')"
    >
      <div class="flex items-center gap-1">
        <NuxtLinkLocale
          to="/"
          tabindex="-1"
          aria-hidden="true"
          class="mr-2"
        >
          <SbcLogo />
        </NuxtLinkLocale>
        <UButton
          v-for="link in mainLinks"
          :key="link.to"
          class="hidden lg:block"
          :label="link.label"
          :to="link.to"
          color="white"
          variant="link"
          size="lg"
          active-class="underline"
        />
      </div>
      <div class="flex gap-1">
        <ClientOnly>
          <UDropdown
            v-if="keycloak.isAuthenticated()"
            :items="loggedInUserOptions"
            :ui="{
              width: '',
              height: 'max-h-60',
              item: {
                disabled:
                  'cursor-text select-text text-bcGovGray-900 dark:text-white opacity-100 font-semibold',
              }
            }"
          >
            <!-- required for UInput aria-label -->
            <!-- eslint-disable vue/attribute-hyphenation -->
            <UButton
              color="white"
              variant="link"
              :ariaLabel="$t('btn.accountOptions')"
            >
              <SbcHeaderAccountLabel
                class="hidden md:flex"
                :username="parseSpecialChars(keycloak.kcUser.value.fullName, 'USER')"
                :account-name="account.currentAccount.name ? parseSpecialChars(account.currentAccount.name, 'ACCOUNT') : ''"
              />
              <UAvatar
                class="md:hidden"
                :alt="parseSpecialChars(keycloak.kcUser.value.fullName, 'U')[0].toUpperCase()"
                :ui="{
                  background: 'bg-bcGovBlue-300 dark:bg-[#E0E7ED]',
                  text: 'font-semibold leading-none text-white dark:text-bcGovColor-darkGray truncate',
                  placeholder: 'font-semibold leading-none text-white truncate dark:text-bcGovColor-darkGray text-xl',
                  rounded: 'rounded-sm'
                }"
              />
            </UButton>

            <template #account>
              <SbcHeaderAccountLabel
                :username="parseSpecialChars(keycloak.kcUser.value.fullName, 'USER')"
                :account-name="account.currentAccount.name ? parseSpecialChars(account.currentAccount.name, 'ACCOUNT') : ''"
                theme="dropdown"
              />
            </template>
          </UDropdown>
        </ClientOnly>
        <LocaleSelect />
      </div>
    </nav>
  </header>
</template>
