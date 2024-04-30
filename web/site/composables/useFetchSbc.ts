export const useFetchSbc = <T>(request, opts?) => {
  if (!opts?.headers?.Authorization) {
    const { $keycloak } = useNuxtApp()
    const token = $keycloak.token

    opts = opts || {}
    Object.assign(opts, { headers: { Authorization: `Bearer ${token}` } })
  }
  if (!opts.headers['Account-Id']) {
    const account = useSbcAccount()
    opts.headers['Account-Id'] = account.currentAccount?.id
  }

  return useFetch<T>(request, opts)
}
