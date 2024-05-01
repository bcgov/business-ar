// redirect user to create account page if no accounts found or error fetching accounts
export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const localePath = useLocalePath()
    const account = useAccountStore()
    try {
      const accounts = await account.getUserAccounts()
      if (accounts?.orgs.length === 0 || accounts === undefined) {
        return navigateTo(localePath('/accounts/create-new'))
      }
    } catch {
      return navigateTo(localePath('/accounts/create-new'))
    }
  }
})
