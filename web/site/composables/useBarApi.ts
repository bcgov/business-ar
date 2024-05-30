// inspired by https://nuxt.com/docs/guide/recipes/custom-usefetch
import type { NitroFetchRequest, NitroFetchOptions } from 'nitropack'

type BarApiOptions<R extends NitroFetchRequest = NitroFetchRequest> = NitroFetchOptions<R>;

type Credentials = 'all' | 'token' | 'account'

export const useBarApi = <T>(
  endpoint: string,
  options: BarApiOptions = {},
  credentials?: Credentials
): Promise<T> => {
  const apiUrl = useRuntimeConfig().public.barApiUrl
  const accountStore = useAccountStore()
  const { $keycloak } = useNuxtApp()
  const token = $keycloak.token

  return $fetch<T>(apiUrl + endpoint, {
    ...options,
    onRequest ({ options }) {
      if (credentials) {
        const headers = options.headers ||= {}

        // Helper function to set headers correctly based on their type
        const setHeader = (key: string, value: string) => {
          if (Array.isArray(headers)) {
            headers.push([key, value])
          } else if (headers instanceof Headers) {
            headers.set(key, value)
          } else {
            headers[key] = value
          }
        }

        if (credentials === 'all' || credentials === 'token') {
          setHeader('Authorization', `Bearer ${token}`)
        }
        if (credentials === 'all' || credentials === 'account') {
          setHeader('Account-Id', accountStore.currentAccount.id.toString())
        }
      }
    },
    onResponseError ({ response }) {
      console.error(response)
    }
  })
}
