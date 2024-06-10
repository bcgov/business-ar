// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  routeRules: {
    '/': { redirect: '/en-CA' }
  },
  modules: [
    '@nuxtjs/eslint-module',
    '@nuxt/test-utils/module',
    '@pinia-plugin-persistedstate/nuxt'
  ],
  extends: ['@daxiom/sbc-nuxt-assets-layer'],
  imports: {
    dirs: ['stores', 'composables', 'enums', 'interfaces', 'types', 'utils']
  },
  i18n: {
    locales: [
      {
        name: 'English',
        code: 'en-CA',
        iso: 'en-CA',
        dir: 'ltr',
        file: 'en-CA.ts'
      },
      {
        name: 'Français',
        code: 'fr-CA',
        iso: 'fr-CA',
        dir: 'ltr',
        file: 'fr-CA.ts'
      }
    ],
    strategy: 'prefix',
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en-CA',
    detectBrowserLanguage: false,
    vueI18n: './i18n.config.ts'
  },
  content: {
    locales: [
      'en-CA',
      'fr-CA'
    ],
    contentHead: false
    // experimental: {
    //   clientDB: true
    // }
  },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  runtimeConfig: {
    public: {
      // Keys within public, will be also exposed to the client-side
      addressCompleteKey: process.env.NUXT_ADDRESS_COMPLETE_KEY,
      payApiURL: `${process.env.NUXT_PAY_API_URL || ''}${process.env.NUXT_PAY_API_VERSION || ''}`,
      keycloakAuthUrl: process.env.NUXT_KEYCLOAK_AUTH_URL,
      keycloakRealm: process.env.NUXT_KEYCLOAK_REALM,
      keycloakClientId: process.env.NUXT_KEYCLOAK_CLIENTID,
      registryHomeURL: process.env.NUXT_APP_REGISTRY_HOME_URL,
      appURL: process.env.NUXT_APP_URL,
      barApiUrl: `${process.env.NUXT_BAR_API_URL || ''}${process.env.NUXT_BAR_API_VERSION || ''}`,
      paymentPortalUrl: process.env.NUXT_PAYMENT_PORTAL_URL,
      baseUrl: process.env.NUXT_BASE_URL,
      environment: process.env.NUXT_ENVIRONMENT_HEADER || '',
      uiVersion: process.env.npm_package_version,
      ldClientId: process.env.NUXT_LD_CLIENT_ID || ''
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "../assets/styles/theme.scss" as *;'
        }
      }
    }
  },
  build: {
    transpile: ['@vuepic/vue-datepicker']
  },
  piniaPersistedstate: {
    storage: 'sessionStorage'
  }
})
