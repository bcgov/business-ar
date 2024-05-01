export const useFetchSbc = <T>(request: string, opts?: any) => {
  if (!opts?.headers?.Authorization) {
    const { $keycloak } = useNuxtApp()
    const token = $keycloak.token

    opts = opts || {}
    Object.assign(opts, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      server: false
    })
  }
  if (!opts.headers['Account-Id']) {
    const account = useAccountStore()
    opts.headers['Account-Id'] = account.currentAccount?.id
  }

  return useFetch<T>(request, opts)
}
