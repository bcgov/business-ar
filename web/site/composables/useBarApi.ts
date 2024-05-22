import type { NitroFetchRequest, AvailableRouterMethod } from 'nitropack'

type Headers = 'all' | 'token' | 'account'

export const useBarApi = async <T>(endpoint: string, method: AvailableRouterMethod<NitroFetchRequest> = 'get', headers?: Headers): Promise<T> => {
  const apiUrl = useRuntimeConfig().public.barApiUrl
  const accountStore = useAccountStore()

  const { $keycloak } = useNuxtApp()
  async function getToken (): Promise<string | undefined> {
    return await $keycloak
      .updateToken(-1)
      .then((_refreshed) => {
        return $keycloak.token
      })
      .catch((error) => {
        console.error(`Failed to get session token: ${error}`)
        return undefined
      })
  }

  const fullHeaders: Record<string, string> = {}

  // Add Authorization header if required
  if (headers === 'all' || headers === 'token') {
    const token = await getToken()
    fullHeaders.Authorization = `Bearer ${token}`
  }

  // Add 'Account-Id' header if required
  if (headers === 'all' || headers === 'account') {
    fullHeaders['Account-Id'] = accountStore.currentAccount.id.toString()
  }

  return $fetch<T>(apiUrl + endpoint, {
    method,
    headers: fullHeaders,
    onResponseError ({ response }) {
      console.error(response)
    }
  })
}
