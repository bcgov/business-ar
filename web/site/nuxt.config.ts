// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  nitro: {
    prerender: {
      routes: []
    }
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
  routeRules: {
    '/': { redirect: '/en-CA' }
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
  },
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  runtimeConfig: {
    public: {
      // Keys within public, will be also exposed to the client-side
      addressCompleteKey: process.env.VUE_APP_ADDRESS_COMPLETE_KEY,
      // authApiURL: `${process.env.VUE_APP_AUTH_API_URL || ''}${process.env.VUE_APP_AUTH_API_VERSION || ''}`,
      // authWebURL: process.env.VUE_APP_AUTH_WEB_URL || '',
      // kcURL: process.env.VUE_APP_KEYCLOAK_AUTH_URL || '',
      // kcRealm: process.env.VUE_APP_KEYCLOAK_REALM || '',
      // kcClient: process.env.VUE_APP_KEYCLOAK_CLIENTID || '',
      // ldClientId: process.env.VUE_APP_LD_CLIENT_ID || '',
      // legalApiURL: `${process.env.VUE_APP_LEGAL_API_URL || ''}${process.env.VUE_APP_LEGAL_API_VERSION_2 || ''}`,
      payApiURL: `${process.env.VUE_APP_PAY_API_URL || ''}${process.env.VUE_APP_PAY_API_VERSION || ''}`,
      // btrApiURL: `${process.env.VUE_APP_BTR_API_URL || ''}${process.env.VUE_APP_BTR_API_VERSION || ''}`,
      // registryHomeURL: process.env.VUE_APP_REGISTRY_HOME_URL || '',
      // appEnv: `${process.env.VUE_APP_POD_NAMESPACE || 'unknown'}`
      keycloakAuthUrl: process.env.NUXT_KEYCLOAK_AUTH_URL,
      keycloakRealm: process.env.NUXT_KEYCLOAK_REALM,
      keycloakClientId: process.env.NUXT_KEYCLOAK_CLIENTID,
      registryHomeURL: process.env.NUXT_APP_REGISTRY_HOME_URL,
      appURL: process.env.NUXT_APP_URL
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
